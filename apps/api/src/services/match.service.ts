import { prisma, Prisma } from "@pronolol/database"
import { GetMatchesQuery } from "../dto/match.dto"
import { z } from "zod"
import { MyPredictionSchema } from "../dto/prediction.dto"

type MyPrediction = z.infer<typeof MyPredictionSchema>

const teamSelect = {
  select: { id: true, name: true, tag: true, logoUrl: true },
} as const

const tournamentSelect = {
  select: {
    id: true,
    name: true,
    league: { select: { id: true, name: true, imageUrl: true } },
  },
} as const

const predictionSelect = {
  select: {
    matchId: true,
    teamId: true,
    predictedTeamAScore: true,
    predictedTeamBScore: true,
    isCorrect: true,
    isExact: true,
    points: true,
    team: { select: { id: true, tag: true, logoUrl: true } },
  },
} as const

const attachMyPredictions = async <T extends { id: string }>(
  matches: T[],
  userId: string
): Promise<(T & { myPrediction: MyPrediction | null })[]> => {
  const predictions = await prisma.prediction.findMany({
    where: { userId, matchId: { in: matches.map((m) => m.id) } },
    ...predictionSelect,
  })
  const byMatchId = new Map(predictions.map((p) => [p.matchId, p]))
  return matches.map((m) => ({
    ...m,
    myPrediction: byMatchId.get(m.id) ?? null,
  }))
}

export const getMatches = async (query: GetMatchesQuery, userId?: string) => {
  const limit = query.limit ?? 20
  const cursorDate = query.cursor ? new Date(query.cursor) : new Date()
  const include = {
    teamA: teamSelect,
    teamB: teamSelect,
    winner: teamSelect,
    tournament: tournamentSelect,
  }

  let matches: Awaited<
    ReturnType<typeof prisma.match.findMany<{ include: typeof include }>>
  >

  if (query.direction === "around") {
    const halfLimit = Math.floor(limit / 2)
    const baseWhere: Prisma.MatchWhereInput =
      query.leagueId && query.leagueId.length > 0
        ? { tournament: { leagueId: { in: query.leagueId } } }
        : {}

    // Fetch up to `limit` from each side so we can compensate when one side
    // has fewer items than halfLimit (e.g. few future matches → take more past).
    const [before, after] = await Promise.all([
      prisma.match.findMany({
        where: { ...baseWhere, matchDate: { lt: cursorDate } },
        include,
        orderBy: { matchDate: "desc" },
        take: limit,
      }),
      prisma.match.findMany({
        where: { ...baseWhere, matchDate: { gte: cursorDate } },
        include,
        orderBy: { matchDate: "asc" },
        take: limit,
      }),
    ])

    // Fill up to `limit` total, prioritising "after" up to halfLimit then
    // compensating from "before" if "after" is short (and vice-versa).
    const afterCount = Math.min(
      after.length,
      halfLimit + Math.max(0, halfLimit - before.length)
    )
    const beforeCount = Math.min(before.length, limit - afterCount)

    matches = [
      ...before.slice(0, beforeCount).reverse(),
      ...after.slice(0, afterCount),
    ]
  } else {
    const where: Prisma.MatchWhereInput = {}
    if (query.leagueId && query.leagueId.length > 0) {
      where.tournament = { leagueId: { in: query.leagueId } }
    }

    if (query.direction === "before") {
      where.matchDate = { lt: cursorDate }
    } else if (query.direction === "after") {
      where.matchDate = { gt: cursorDate }
    } else if (query.state) {
      const now = new Date()
      if (query.state === "upcoming") {
        where.matchDate = { gte: now }
        where.state = { not: "completed" }
      } else if (query.state === "completed") {
        where.state = "completed"
      } else if (query.state === "inProgress") {
        where.matchDate = { lte: now }
        where.state = { not: "completed" }
      }
    }

    const orderBy: Prisma.MatchOrderByWithRelationInput = {
      matchDate:
        query.direction === "before"
          ? "desc"
          : query.state === "completed"
            ? "desc"
            : "asc",
    }

    const result = await prisma.match.findMany({
      where,
      include,
      orderBy,
      take: limit,
      ...(query.offset && { skip: query.offset }),
    })

    matches = query.direction === "before" ? result.reverse() : result
  }

  if (userId) return attachMyPredictions(matches, userId)
  return matches.map((m) => ({ ...m, myPrediction: null }))
}

export const findMatchById = async (id: string) => {
  return prisma.match.findUnique({ where: { id } })
}

export const getMatchById = async (id: string) => {
  return prisma.match.findUnique({
    where: { id },
    include: {
      teamA: true,
      teamB: true,
      winner: true,
      tournament: { include: { league: true } },
      predictions: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })
}
