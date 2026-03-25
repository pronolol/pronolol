import { z } from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"

extendZodWithOpenApi(z)

export const UserPreferencesSchema = z
  .object({
    leagueIds: z.array(z.string()),
    discordNotificationsEnabled: z.boolean(),
  })
  .openapi("UserPreferences", {
    description: "User's saved filter preferences for the match feed",
  })

export type UserPreferencesDTO = z.infer<typeof UserPreferencesSchema>

export const UpdateUserPreferencesSchema = z
  .object({
    leagueIds: z.array(z.string()).optional(),
    discordNotificationsEnabled: z.boolean().optional(),
  })
  .openapi("UpdateUserPreferences", {
    description: "Body for updating user feed filter preferences",
  })

export type UpdateUserPreferencesDTO = z.infer<
  typeof UpdateUserPreferencesSchema
>
