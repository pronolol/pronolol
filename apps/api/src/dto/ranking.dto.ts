import { z } from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"
import { TournamentSummarySchema } from "./league.dto"

extendZodWithOpenApi(z)

export const GetRankingQuerySchema = z.object({
  leagueId: z.string().optional(),
  tournamentId: z.string().optional(),
})

export type GetRankingQuery = z.infer<typeof GetRankingQuerySchema>

export const RankingEntrySchema = z
  .object({
    rank: z.number().int().positive(),
    userId: z.string(),
    displayName: z.string(),
    username: z.string().nullable(),
    image: z.string().nullable(),
    totalPoints: z.number().int(),
    totalPredictions: z.number().int(),
    correctPredictions: z.number().int(),
    exactPredictions: z.number().int(),
    correctnessPercentage: z.number().min(0).max(100),
  })
  .openapi("RankingEntry", {
    description: "User ranking entry with statistics",
  })

export type RankingEntryDTO = z.infer<typeof RankingEntrySchema>

export const RankingResponseSchema = z
  .object({
    rankings: z.array(RankingEntrySchema),
    filters: z.object({
      leagueId: z.string().nullable(),
      tournamentId: z.string().nullable(),
    }),
  })
  .openapi("RankingResponse", {
    description: "Ranking response with user statistics",
  })

export type RankingResponseDTO = z.infer<typeof RankingResponseSchema>

export const RankingFilterLeagueSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    tournaments: z.array(TournamentSummarySchema),
  })
  .openapi("RankingFilterLeague", {
    description:
      "League with the tournaments that have at least one scored prediction",
  })

export const RankingFiltersResponseSchema = z
  .array(RankingFilterLeagueSchema)
  .openapi("RankingFiltersResponse", {
    description: "Leagues and tournaments available as ranking filters",
  })

export type RankingFiltersResponseDTO = z.infer<
  typeof RankingFiltersResponseSchema
>
