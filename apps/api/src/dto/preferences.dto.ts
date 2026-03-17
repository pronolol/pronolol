import { z } from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"

extendZodWithOpenApi(z)

export const UserPreferencesSchema = z
  .object({
    leagueId: z.string().nullable(),
    tournamentId: z.string().nullable(),
  })
  .openapi("UserPreferences", {
    description: "User's saved filter preferences for the match feed",
  })

export type UserPreferencesDTO = z.infer<typeof UserPreferencesSchema>

export const UpdateUserPreferencesSchema = z
  .object({
    leagueId: z.string().nullable().optional(),
    tournamentId: z.string().nullable().optional(),
  })
  .openapi("UpdateUserPreferences", {
    description: "Body for updating user feed filter preferences",
  })

export type UpdateUserPreferencesDTO = z.infer<
  typeof UpdateUserPreferencesSchema
>
