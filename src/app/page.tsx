"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { client } from "@/lib/graphqlClient";
import {
  getSdk,
  GetAnimeByIdQuery,
  MediaType,
  MediaSort,
  MediaStatus,
  MediaFormat,
} from "@/graphql/generated/anilist";

type Anime = NonNullable<GetAnimeByIdQuery["anime"]>;

const FILTERS = {
  sort: [MediaSort.Id],
  type: MediaType.Anime,
  statusNot: MediaStatus.NotYetReleased,
  isAdult: false,
  formatIn: [MediaFormat.Tv],
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

    const randomPage = Math.floor(Math.random() * totalAnimes) + 1;
    const data = await sdk.GetAnimeByPage({
      page: randomPage,
      ...FILTERS,
    });

    if (data.Page?.anime) {
      setAnime(data.Page.anime[0]);
      const anime = data.Page.anime[0];
      if (anime) {
        console.log(
          `ID: ${anime.id} | Title: ${anime.title?.romaji || anime.title?.english || anime.title?.native} | Page: ${randomPage}`,
        );
      }
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
              {anime.externalLinks?.map((link: any) => (
                <div key={link.id} className="flex gap-2 items-center">
                  <span>{`${link.site} (${link.siteId})`}</span>

                  <span>{link.type}</span>

                  {link.isDisabled ? (
                    <span className="italic">Desabilitado</span>
                  ) : (
                    <Link href={link.url} target="_blank" className="underline">
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
