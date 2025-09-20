"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { client } from "@/lib/graphqlClient";
import { getSdk, GetAnimeByIdQuery } from "@/graphql/generated/anilist";

type Anime = NonNullable<GetAnimeByIdQuery["anime"]>;

export default function Home() {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function getAnime() {
    setIsLoading(true);

    const sdk = getSdk(client);
    const data = await sdk.GetAnimeById({ id: 1535 });

    if (data.anime) setAnime(data.anime);

    setIsLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen justify-center items-center gap-8 p-4">
      <button
        className="text-white font-medium rounded-lg text-sm px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-800"
        type="button"
        onClick={getAnime}
      >
        Me anime
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
              <h2>{anime.title?.romaji || "Título romanji não encontrado."}</h2>
              <h3>{anime.title?.english || "Título inglês não encontrado."}</h3>
              <span>{`id: ${anime.id} (idMal: ${anime.idMal})`}</span>
              <span>{anime.format}</span>
              <span>{anime.seasonYear}</span>
              <span>{`${anime.averageScore}%`}</span>
              <span>{`${anime.episodes} eps`}</span>
              <span>{anime.genres?.join(", ")}</span>
              <p>{anime.description}</p>

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
                    alt="Trailer Tumbanil"
                    width={480}
                    height={360}
                    src={anime.trailer.thumbnail}
                  />
                )}

                {anime.trailer?.id && (
                  <Link
                    href={`https://www.youtube.com/watch?v=${anime.trailer.id}`}
                    target="_blank"
                    className="underline"
                  >
                    Assistir
                  </Link>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
