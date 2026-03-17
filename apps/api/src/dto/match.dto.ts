import { z } from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"
import { MyPredictionSchema } from "./prediction.dto"

extendZodWithOpenApi(z)

export const TeamSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    tag: z.string(),
    logoUrl: z.string(),
  })
  .openapi("Team", {
    description: "Team information",
  })

export type TeamDTO = z.infer<typeof TeamSchema>

export const TournamentSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    league: z
      .object({
        id: z.string(),
        name: z.string(),
        imageUrl: z.string(),
      })
      .openapi({ description: "League information" }),
  })
  .openapi("Tournament", {
    description: "Tournament information",
  })

export const MatchSchema = z
  .object({
    id: z.string(),
    matchDate: z.coerce.date(),
    state: z.string(),
    bestOf: z.number().int().positive(),
    stage: z.string().nullable(),
    teamA: TeamSchema,
    teamB: TeamSchema,
    winner: TeamSchema.nullable(),
    teamAScore: z.number().int().nullable(),
    teamBScore: z.number().int().nullable(),
    tournament: TournamentSchema,
    myPrediction: MyPredictionSchema.nullable(),
  })
  .openapi("Match", {
    description: "Match details with teams and tournament information",
  })

export type MatchDTO = z.infer<typeof MatchSchema>

export const GetMatchesQuerySchema = z
  .object({
    leagueId: z
      .union([z.string().transform((v) => [v]), z.array(z.string())])
      .optional()
      .openapi({
        description: "Filter matches by league ID (repeatable)",
        example: "abc123",
      }),
    state: z.enum(["upcoming", "completed", "inProgress"]).optional().openapi({
      description: "Filter matches by state",
      example: "upcoming",
    }),
    cursor: z.string().optional().openapi({
      description:
        "ISO date string to use as cursor for pagination. If not provided, current time is used.",
      example: "2026-01-30T12:00:00.000Z",
    }),
    direction: z.enum(["before", "after", "around"]).optional().openapi({
      description:
        "Direction to fetch matches relative to cursor. 'around' returns matches both before and after.",
      example: "around",
    }),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().positive())
      .optional()
      .openapi({
        description: "Maximum number of results to return",
        example: "20",
      }),
    offset: z
      .string()
      .transform(Number)
      .pipe(z.number().nonnegative())
      .optional()
      .openapi({
        description: "Number of results to skip for pagination",
        example: "0",
      }),
  })
  .openapi({
    description: "Query parameters for filtering matches",
  })

export type GetMatchesQuery = z.infer<typeof GetMatchesQuerySchema>

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
    details: z.any().optional(),
  })
  .openapi("ErrorResponse", {
    description: "Error response",
  })
