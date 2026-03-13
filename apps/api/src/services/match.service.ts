import { prisma, Prisma } from "@pronolol/database"
import { GetMatchesQuery } from "../dto/match.dto"

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

export const getMatches = async (query: GetMatchesQuery) => {
  const limit = query.limit ?? 20
  const cursorDate = query.cursor ? new Date(query.cursor) : new Date()
  const include = {
    teamA: teamSelect,
    teamB: teamSelect,
    winner: teamSelect,
    tournament: tournamentSelect,
  }

  if (query.direction === "around") {
    const halfLimit = Math.floor(limit / 2)
    const baseWhere: Prisma.MatchWhereInput = query.tournamentId
      ? { tournamentId: query.tournamentId }
      : {}

    const [before, after] = await Promise.all([
      prisma.match.findMany({
        where: { ...baseWhere, matchDate: { lt: cursorDate } },
        include,
        orderBy: { matchDate: "desc" },
        take: halfLimit,
      }),
      prisma.match.findMany({
        where: { ...baseWhere, matchDate: { gte: cursorDate } },
        include,
        orderBy: { matchDate: "asc" },
        take: halfLimit,
      }),
    ])

    return [...before.reverse(), ...after]
  }

  const where: Prisma.MatchWhereInput = {}
  if (query.tournamentId) where.tournamentId = query.tournamentId

  if (query.direction === "before") {
    where.matchDate = { lt: cursorDate }
  } else if (query.direction === "after") {
    where.matchDate = { gte: cursorDate }
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

  const matches = await prisma.match.findMany({
    where,
    include,
    orderBy,
    take: limit,
    ...(query.offset && { skip: query.offset }),
  })

  return query.direction === "before" ? matches.reverse() : matches
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
