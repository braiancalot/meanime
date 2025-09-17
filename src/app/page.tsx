"use client";

import { useState } from "react";
import { gql, request } from "graphql-request";

import Image from "next/image";
import Link from "next/link";

const document = gql`
  query Media($id: Int) {
    Media(id: $id) {
      id
      idMal
      format
      title {
        english
        native
        romaji
      }
      description
      coverImage {
        extraLarge
      }
      bannerImage
      seasonYear
      episodes
      averageScore
      genres
      externalLinks {
        id
        site
        siteId
        type
        isDisabled
        url
      }
      trailer {
        id
        site
        thumbnail
      }
    }
  }
`;

export default function Home() {
  const [anime, setAnime] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);

  async function getAnime() {
    setIsLoading(true);

    const data: any = await request("https://graphql.anilist.co", document, {
      id: 1535,
    });

    setAnime(data.Media);

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
            <Image
              alt="Anime Banner"
              width={230}
              height={325}
              src={anime.bannerImage}
            />

            <Image
              alt="Anime Cover"
              width={230}
              height={325}
              src={anime.coverImage.extraLarge}
            />

            <div className="flex flex-col items-center gap-2">
              <h2>{anime.title.romaji}</h2>
              <h3>{anime.title.english}</h3>
              <span>{`id: ${anime.id} (idMal: ${anime.idMal})`}</span>
              <span>{anime.format}</span>
              <span>{anime.seasonYear}</span>
              <span>{`${anime.averageScore}%`}</span>
              <span>{`${anime.episodes} eps`}</span>

              <span>{anime.genres?.join(", ")}</span>
              <p>{anime.description}</p>

              <span>Links:</span>
              {anime.externalLinks.map((link: any) => (
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
                <Image
                  alt="Trailer Tumbanil"
                  width={480}
                  height={360}
                  src={anime.trailer.thumbnail}
                />
                <Link
                  href={`https://www.youtube.com/watch?v=${anime.trailer.id}`}
                  target="_blank"
                  className="underline"
                >
                  Assistir
                </Link>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
