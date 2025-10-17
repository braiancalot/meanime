import { getSdk, ExternalLinkType } from "@/graphql/generated/anilist";
import { client as graphqlClient } from "@/lib/graphqlClient";

import { FILTERS } from "@/lib/constants";
import { Anime } from "@/lib/types";

const VALID_STREAMINGS = {
  "5": "Crunchyroll",
  "10": "Netflix",
  "21": "Amazon Prime Video",
};

export function isAnimeValid(anime: Anime | null | undefined): anime is Anime {
  if (!anime) {
    console.log("[Anime Inválido] null ou undefined");
    return false;
  }

  if (!anime.externalLinks || anime.externalLinks.length == 0) {
    console.log(
      `[Anime Inválido] Não contém external links | ID: ${anime.id} | Title: ${anime.title?.romaji || anime.title?.english || anime.title?.native}`,
    );
    return false;
  }

  return true;
}

export function formatAnimeData(anime: Anime): Anime {
  const validStreamingsLinks = (anime.externalLinks || [])
    .filter((link) => link?.type === ExternalLinkType.Streaming)
    .map((link) => {
      if (link?.siteId != null && link.siteId in VALID_STREAMINGS) {
        return link;
      }

      return { ...link, id: link?.id || -1, site: link?.site + " - INVALID" };
    });

  return {
    ...anime,
    externalLinks: validStreamingsLinks,
  };
}

async function getRandomFromAnilist(): Promise<Anime> {
  const sdk = getSdk(graphqlClient);

  const pageInfoData = await sdk.GetPageInfo(FILTERS);
  const total = pageInfoData.Page?.pageInfo?.total;

  if (!total) {
    throw new Error("Failet to get total count");
  }

  const MAX_ATTEMPTS = 5;
  let validAnime: Anime | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(
      `Tentativa ${attempt}/${MAX_ATTEMPTS} de encontrar um anime válido...`,
    );

    const randomPage = Math.floor(Math.random() * total) + 1;
    const data = await sdk.GetAnimeByPage({ page: randomPage, ...FILTERS });
    const candidateAnime = data.Page?.anime?.[0];

    if (isAnimeValid(candidateAnime)) {
      validAnime = formatAnimeData(candidateAnime);
      break;
    }
  }

  if (!validAnime) {
    throw new Error(`Could not find a valid anime in ${MAX_ATTEMPTS} attempts`);
  }

  return validAnime;
}

export async function getRandom(): Promise<Anime> {
  const anime = await getRandomFromAnilist();
  return anime;
}

const animeService = {
  getRandom,
};

export default animeService;
