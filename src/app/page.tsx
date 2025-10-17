"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { ExternalLinkType } from "@/graphql/generated/anilist";
import { Anime } from "@/lib/types";

export default function Home() {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function getRandomAnime() {
    setIsLoading(true);
    setAnime(null);
    setError(null);

    try {
      const response = await fetch("/api/random-anime");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const data: Anime = await response.json();
      setAnime(data);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen justify-center items-center gap-8 p-4">
      <button
        className="text-white font-medium rounded-lg text-sm px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-800"
        type="button"
        onClick={getRandomAnime}
      >
        Me anime
      </button>

      {isLoading && <p>Procurando um anime incrível para você...</p>}

      {error && <p className="text-red-500">Ocorreu um erro: {error}</p>}

      {anime && (
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
      )}
    </div>
  );
}
