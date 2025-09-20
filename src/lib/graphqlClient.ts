import { GraphQLClient } from "graphql-request";

const endpoint = "https://graphql.anilist.co";

export const client = new GraphQLClient(endpoint);
