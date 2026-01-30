import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import {
  MatchSchema,
  GetMatchesQuerySchema,
  ErrorResponseSchema,
} from "./dto/match.dto";
import { z } from "zod";

const registry = new OpenAPIRegistry();

// Register schemas
registry.register("Team", MatchSchema.shape.teamA);
registry.register("Match", MatchSchema);
registry.register("ErrorResponse", ErrorResponseSchema);

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
});

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
});

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
});

const generator = new OpenApiGeneratorV3(registry.definitions);

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
  ],
});
