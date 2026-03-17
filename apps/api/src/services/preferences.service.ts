import { prisma } from "@pronolol/database"
import { UpdateUserPreferencesDTO } from "../dto/preferences.dto"

export const getUserPreferences = async (userId: string) => {
  const prefs = await prisma.userPreferences.findUnique({
    where: { userId },
    select: { leagueIds: true },
  })
  return {
    leagueIds: prefs?.leagueIds ?? [],
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
    },
    update: {
      ...(data.leagueIds !== undefined && { leagueIds: data.leagueIds }),
    },
    select: { leagueIds: true },
  })
  return {
    leagueIds: prefs.leagueIds,
  }
}
