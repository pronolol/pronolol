import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi"
import {
  MatchSchema,
  GetMatchesQuerySchema,
  ErrorResponseSchema,
} from "./dto/match.dto"
import { GetRankingQuerySchema, RankingResponseSchema } from "./dto/ranking.dto"
import { MyPredictionSchema } from "./dto/prediction.dto"
import {
  UserPreferencesSchema,
  UpdateUserPreferencesSchema,
} from "./dto/preferences.dto"
import { LeagueWithTournamentsSchema } from "./dto/league.dto"
import { z } from "zod"

const registry = new OpenAPIRegistry()

// Register schemas
registry.register("Team", MatchSchema.shape.teamA)
registry.register("MyPrediction", MyPredictionSchema)
registry.register("Match", MatchSchema)
registry.register("ErrorResponse", ErrorResponseSchema)
registry.register("UserPreferences", UserPreferencesSchema)
registry.register("UpdateUserPreferences", UpdateUserPreferencesSchema)
registry.register("LeagueWithTournaments", LeagueWithTournamentsSchema)

// Register paths
registry.registerPath({
  method: "get",
  path: "/",
  description: "API Root",
  summary: "Welcome endpoint",
  responses: {
    200: {
      description: "Welcome message",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
})

registry.registerPath({
  method: "get",
  path: "/matches",
  description:
    "Retrieve a list of matches with optional filtering by tournament, state, and pagination",
  summary: "Get all matches",
  tags: ["Matches"],
  request: {
    query: GetMatchesQuerySchema,
  },
  responses: {
    200: {
      description: "List of matches",
      content: {
        "application/json": {
          schema: z.array(MatchSchema),
        },
      },
    },
    400: {
      description: "Invalid query parameters",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: "get",
  path: "/matches/{id}",
  description:
    "Retrieve detailed information about a specific match including predictions",
  summary: "Get match by ID",
  tags: ["Matches"],
  request: {
    params: z.object({
      id: z.string().openapi({
        description: "Match ID",
        example: "match123",
      }),
    }),
  },
  responses: {
    200: {
      description: "Match details",
      content: {
        "application/json": {
          schema: MatchSchema,
        },
      },
    },
    404: {
      description: "Match not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: "get",
  path: "/ranking",
  description:
    "Retrieve user rankings based on prediction performance. Can be filtered by league or tournament. Rankings are sorted by total points (descending), then by correctness percentage.",
  summary: "Get user rankings",
  tags: ["Rankings"],
  request: {
    query: GetRankingQuerySchema,
  },
  responses: {
    200: {
      description: "User rankings with statistics",
      content: {
        "application/json": {
          schema: RankingResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid query parameters",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: "get",
  path: "/users/me/predictions",
  description: "Retrieve all predictions made by the authenticated user",
  summary: "Get my predictions",
  tags: ["Users"],
  responses: {
    200: {
      description: "List of the current user's predictions",
      content: {
        "application/json": {
          schema: z.array(MyPredictionSchema),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: "get",
  path: "/users/me/preferences",
  description:
    "Retrieve the authenticated user's saved match feed filter preferences",
  summary: "Get my preferences",
  tags: ["Users"],
  responses: {
    200: {
      description: "User's filter preferences",
      content: {
        "application/json": {
          schema: UserPreferencesSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: "put",
  path: "/users/me/preferences",
  description: "Save the authenticated user's match feed filter preferences",
  summary: "Update my preferences",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateUserPreferencesSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Updated preferences",
      content: {
        "application/json": {
          schema: UserPreferencesSchema,
        },
      },
    },
    400: {
      description: "Invalid body",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: "get",
  path: "/leagues",
  description: "Retrieve all leagues with their tournaments",
  summary: "Get all leagues",
  tags: ["Leagues"],
  responses: {
    200: {
      description: "List of leagues with tournaments",
      content: {
        "application/json": {
          schema: z.array(LeagueWithTournamentsSchema),
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

const generator = new OpenApiGeneratorV3(registry.definitions)

export const openApiDocument = generator.generateDocument({
  openapi: "3.1.0",
  info: {
    title: "Pronolol API",
    version: "1.0.0",
    description: "API for managing esports match predictions and rankings",
  },
  servers: [
    {
      url: process.env.BETTER_AUTH_URL || "http://localhost:3000",
      description:
        process.env.NODE_ENV === "production"
          ? "Production server"
          : "Development server",
    },
  ],
  tags: [
    {
      name: "Matches",
      description: "Match management endpoints",
    },
    {
      name: "Rankings",
      description: "User ranking and leaderboard endpoints",
    },
    {
      name: "Users",
      description: "Authenticated user endpoints",
    },
    {
      name: "Leagues",
      description: "League and tournament reference endpoints",
    },
  ],
})
