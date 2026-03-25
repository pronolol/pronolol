import { prisma } from "@pronolol/database"
import { UpdateUserPreferencesDTO } from "../dto/preferences.dto"

export const getUserPreferences = async (userId: string) => {
  const prefs = await prisma.userPreferences.findUnique({
    where: { userId },
    select: { leagueIds: true, discordNotificationsEnabled: true },
  })
  return {
    leagueIds: prefs?.leagueIds ?? [],
    discordNotificationsEnabled: prefs?.discordNotificationsEnabled ?? true,
  }
}

export const upsertUserPreferences = async (
  userId: string,
  data: UpdateUserPreferencesDTO
) => {
  const prefs = await prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      leagueIds: data.leagueIds ?? [],
      discordNotificationsEnabled: data.discordNotificationsEnabled ?? true,
    },
    update: {
      ...(data.leagueIds !== undefined && { leagueIds: data.leagueIds }),
      ...(data.discordNotificationsEnabled !== undefined && {
        discordNotificationsEnabled: data.discordNotificationsEnabled,
      }),
    },
    select: { leagueIds: true, discordNotificationsEnabled: true },
  })
  return {
    leagueIds: prefs.leagueIds,
    discordNotificationsEnabled: prefs.discordNotificationsEnabled,
  }
}
