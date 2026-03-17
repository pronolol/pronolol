import { prisma } from "@pronolol/database"
import { UpdateUserPreferencesDTO } from "../dto/preferences.dto"

export const getUserPreferences = async (userId: string) => {
  const prefs = await prisma.userPreferences.findUnique({
    where: { userId },
    select: { leagueId: true, tournamentId: true },
  })
  return {
    leagueId: prefs?.leagueId ?? null,
    tournamentId: prefs?.tournamentId ?? null,
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
      leagueId: data.leagueId ?? null,
      tournamentId: data.tournamentId ?? null,
    },
    update: {
      ...(data.leagueId !== undefined && { leagueId: data.leagueId }),
      ...(data.tournamentId !== undefined && {
        tournamentId: data.tournamentId,
      }),
    },
    select: { leagueId: true, tournamentId: true },
  })
  return {
    leagueId: prefs.leagueId,
    tournamentId: prefs.tournamentId,
  }
}
