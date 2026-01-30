import { z } from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"

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
  })
  .openapi("Match", {
    description: "Match details with teams and tournament information",
  })

export type MatchDTO = z.infer<typeof MatchSchema>

export const GetMatchesQuerySchema = z
  .object({
    tournamentId: z.string().optional().openapi({
      description: "Filter matches by tournament ID",
      example: "abc123",
    }),
    state: z.enum(["upcoming", "completed", "inProgress"]).optional().openapi({
      description: "Filter matches by state",
      example: "upcoming",
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
