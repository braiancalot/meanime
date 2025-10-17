import {
  MediaType,
  MediaSort,
  MediaStatus,
  MediaFormat,
} from "@/graphql/generated/anilist";

export const FILTERS = {
  sort: [MediaSort.Id],
  type: MediaType.Anime,
  statusNot: MediaStatus.NotYetReleased,
  isAdult: false,
  formatIn: [MediaFormat.Tv],
};
