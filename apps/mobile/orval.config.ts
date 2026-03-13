import { defineConfig } from "orval"

export default defineConfig({
  api: {
    input: {
      target: "../api/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./api/generated/endpoints.ts",
      schemas: "./api/generated/models",
      client: "react-query",
      httpClient: "axios",
      override: {
        mutator: {
          path: "./api/client.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useSuspenseQuery: false,
          signal: true,
        },
      },
    },
  },
})
