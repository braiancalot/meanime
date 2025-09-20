import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://graphql.anilist.co",
  generates: {
    "schemas/anilist.schema.json": {
      plugins: ["introspection"],
    },
  },
};

export default config;
