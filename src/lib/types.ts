import type { GetAnimeByPageQuery } from "@/graphql/generated/anilist";

export type Anime = NonNullable<
  NonNullable<NonNullable<GetAnimeByPageQuery["Page"]>["anime"]>[number]
>;
