import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "schemas/anilist.schema.json",
  documents: ["src/graphql/anilist/**/*.graphql"],
  generates: {
    "src/graphql/generated/anilist.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-graphql-request",
      ],
    },
  },
};

export default config;
