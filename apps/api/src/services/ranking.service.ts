import { prisma, Prisma } from "@pronolol/database"
import { GetRankingQuery } from "../dto/ranking.dto"

interface ScoredPrediction {
  user: {
    id: string
    name: string | null
    displayUsername: string | null
    username: string | null
    image: string | null
  }
  points: number | null
  isCorrect: boolean | null
  isExact: boolean | null
}

export interface RankingEntry {
  rank: number
  userId: string
  displayName: string
  username: string | null
  image: string | null
  totalPoints: number
  totalPredictions: number
  correctPredictions: number
  exactPredictions: number
  correctnessPercentage: number
}

export const computeRankings = (
  predictions: ScoredPrediction[]
): RankingEntry[] => {
  const statsMap = new Map<
    string,
    Omit<RankingEntry, "rank" | "correctnessPercentage">
  >()

  for (const prediction of predictions) {
    const { id: userId } = prediction.user
    const stats = statsMap.get(userId) ?? {
      userId,
      displayName:
        prediction.user.displayUsername ??
        prediction.user.username ??
        prediction.user.name ??
        "Unknown",
      username: prediction.user.username,
      image: prediction.user.image,
      totalPoints: 0,
      totalPredictions: 0,
      correctPredictions: 0,
      exactPredictions: 0,
    }

    stats.totalPoints += prediction.points ?? 0
    stats.totalPredictions += 1
    if (prediction.isCorrect) stats.correctPredictions += 1
    if (prediction.isExact) stats.exactPredictions += 1

    statsMap.set(userId, stats)
  }

  return Array.from(statsMap.values())
    .map((stats) => ({
      ...stats,
      correctnessPercentage:
        stats.totalPredictions > 0
          ? Math.round(
              (stats.correctPredictions / stats.totalPredictions) * 100
            )
          : 0,
    }))
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
      return b.correctnessPercentage - a.correctnessPercentage
    })
    .map((entry, index) => ({ rank: index + 1, ...entry }))
}

export const fetchRankingPredictions = async (query: GetRankingQuery) => {
  const where: Prisma.PredictionWhereInput = {
    points: { not: null },
  }

  if (query.tournamentId || query.leagueId) {
    where.match = {}
    if (query.tournamentId) where.match.tournamentId = query.tournamentId
    if (query.leagueId) where.match.tournament = { leagueId: query.leagueId }
  }

  return prisma.prediction.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayUsername: true,
          username: true,
          image: true,
        },
      },
      match: {
        include: { tournament: { include: { league: true } } },
      },
    },
  })
}
