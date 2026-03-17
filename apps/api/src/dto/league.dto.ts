import { z } from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"

extendZodWithOpenApi(z)

export const TournamentSummarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .openapi("TournamentSummary", {
    description: "Tournament basic info",
  })

export const LeagueWithTournamentsSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    imageUrl: z.string(),
    tournaments: z.array(TournamentSummarySchema),
  })
  .openapi("LeagueWithTournaments", {
    description: "League with its tournaments",
  })

export type LeagueWithTournamentsDTO = z.infer<
  typeof LeagueWithTournamentsSchema
>
