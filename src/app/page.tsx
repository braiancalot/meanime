"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { client } from "@/lib/graphqlClient";
import {
  getSdk,
  MediaType,
  MediaSort,
  MediaStatus,
  ExternalLinkType,
  MediaFormat,
  GetAnimeByPageQuery,
} from "@/graphql/generated/anilist";

type Anime = NonNullable<
  NonNullable<NonNullable<GetAnimeByPageQuery["Page"]>["anime"]>[number]
>;

const FILTERS = {
  sort: [MediaSort.Id],
  type: MediaType.Anime,
  statusNot: MediaStatus.NotYetReleased,
  isAdult: false,
  formatIn: [MediaFormat.Tv],
};

const VALID_STREAMINGS = {
  "5": "Crunchyroll",
  "10": "Netflix",
  "21": "Amazon Prime Video",
};

const sdk = getSdk(client);

export default function Home() {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [totalAnimes, setTotalAnimes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getTotalAnimes();
  }, []);

  async function getTotalAnimes() {
    const data = await sdk.GetPageInfo(FILTERS);

    if (data.Page?.pageInfo?.total) {
      setTotalAnimes(data.Page?.pageInfo?.total);
    }
  }

  async function getRandomAnime() {
    if (totalAnimes === 0) return;
    setIsLoading(true);

    const MAX_ATTEMPTS = 5;
    let validAnime: Anime | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      console.log(
        `Tentativa ${attempt}/${MAX_ATTEMPTS} de encontrar um anime válido...`,
      );

      try {
        const randomPage = Math.floor(Math.random() * totalAnimes) + 1;
        const data = await sdk.GetAnimeByPage({ page: randomPage, ...FILTERS });
        const candidateAnime = data.Page?.anime?.[0];

        if (isAnimeValid(candidateAnime)) {
          console.log(`[Anime Válido] ID: ${candidateAnime.id}`);
          validAnime = formatAnimeData(candidateAnime);
          break;
        }
      } catch (error) {
        console.error("Erro na API:", error);
        break;
      }
    }

    if (validAnime) {
      setAnime(validAnime);
    }

    setIsLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen justify-center items-center gap-8 p-4">
      <button
        className="text-white font-medium rounded-lg text-sm px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-800"
        type="button"
        onClick={getRandomAnime}
      >
        {`Me anime (${totalAnimes})`}
      </button>

      {isLoading ? (
        <div className="flex flex-col items-center ">Carregando...</div>
      ) : (
        anime && (
          <div className="flex flex-col items-center gap-4">
            {anime.bannerImage && (
              <Image
                alt="Anime Banner"
                width={230}
                height={325}
                src={anime.bannerImage}
              />
            )}

            {anime.coverImage?.extraLarge && (
              <Image
                alt="Anime Cover"
                width={230}
                height={325}
                src={anime.coverImage.extraLarge}
              />
            )}

            <div className="flex flex-col items-center gap-2">
              <h2>{anime.title?.romaji || "TÍTULO ROMANJI NÃO ENCONTRADO"}</h2>
              <h3>{anime.title?.english || "TÍTULO INGLÊS NÃO ENCONTRADO"}</h3>
              <span>{`id: ${anime.id} (idMal: ${anime.idMal})`}</span>
              <span>{`Formato: ${anime.format}`}</span>
              <span>{`Ano: ${anime.seasonYear}`}</span>
              <span>{`Avaliação: ${anime.averageScore}%`}</span>
              <span>{`Nº de Episódios: ${anime.episodes}`}</span>
              <span>{`Gêneros: ${anime.genres?.join(", ")}`}</span>
              <p>{`Sinopse: ${anime.description}`}</p>

              <span>Links:</span>
              {anime.externalLinks
                ?.filter((link) => link?.type === ExternalLinkType.Streaming)
                .map((link: any) => (
                  <div key={link.id} className="flex gap-2 items-center">
                    <span>{`${link.site} (${link.siteId})`}</span>

                    <span>{link.type}</span>

                    {link.isDisabled ? (
                      <span className="italic">Desabilitado</span>
                    ) : (
                      <Link
                        href={link.url}
                        target="_blank"
                        className="underline"
                      >
                        Acessar
                      </Link>
                    )}
                  </div>
                ))}

              <div className="mt-4 flex flex-col items-center">
                <span>Trailer</span>

                {anime.trailer?.thumbnail && (
                  <Image
                    alt="Trailer Thumbnail"
                    width={480}
                    height={360}
                    src={anime.trailer.thumbnail}
                  />
                )}

                {anime.trailer?.id ? (
                  <Link
                    href={`https://www.youtube.com/watch?v=${anime.trailer.id}`}
                    target="_blank"
                    className="underline"
                  >
                    Assistir
                  </Link>
                ) : (
                  "TRAILER NÃO ENCONTRADO"
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function isAnimeValid(anime: Anime | null | undefined): anime is Anime {
  if (!anime) {
    console.log("[Anime Inválido] null ou undefined");
    return false;
  }

  if (!anime.externalLinks || anime.externalLinks.length == 0) {
    const message = `[Anime Inválido] Não contém external links | ID: ${anime.id} | Title: ${anime.title?.romaji || anime.title?.english || anime.title?.native}`;

    console.log(message);
    window.alert(message); // debug
    return false;
  }

  return true;
}

function formatAnimeData(anime: Anime): Anime {
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
