import { defineConfig } from "orval"

export default defineConfig({
  api: {
    input: {
      target: "../api/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated/endpoints.ts",
      schemas: "./src/api/generated/models",
      client: "react-query",
      httpClient: "axios",
      override: {
        mutator: {
          path: "./src/api/client.ts",
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
