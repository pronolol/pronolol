import {
  ScraperOutput,
  NormalizedLeague,
  NormalizedTeam,
  NormalizedTournament,
  NormalizedMatch,
} from "../types"

import { prisma } from "@pronolol/database"

import "dotenv/config"

export class DatabaseService {
  async saveScrapedData(data: ScraperOutput): Promise<void> {
    console.error("💾 Saving data to the database...")

    // The order is important to respect foreign key constraints.
    await this.upsertLeagues(data.leagues)
    await this.upsertTeams(data.teams)
    await this.upsertTournaments(data.tournaments)
    await this.upsertMatches(data.matches)

    console.error("✅ Database save complete.")
  }

  private async upsertLeagues(leagues: NormalizedLeague[]): Promise<void> {
    if (leagues.length === 0) return

    const result = await prisma.league.createMany({
      data: leagues.map((league) => ({
        id: league.id,
        name: league.name,
        imageUrl: league.image,
        region: league.region,
        regionSlug: league.regionSlug,
      })),
      skipDuplicates: true,
    })

    console.error(`\tInserted ${result.count} new leagues.`)
    console.error(`\tUpserted ${result.count} leagues.`)
  }

  private async upsertTeams(teams: NormalizedTeam[]): Promise<void> {
    if (teams.length === 0) return

    for (const team of teams) {
      await prisma.team.upsert({
        where: { id: team.id },
        update: {
          logoUrl: team.logo,
        },
        create: {
          id: team.id,
          name: team.name,
          tag: team.tag,
          logoUrl: team.logo,
        },
      })
    }

    console.error(`\tUpserted ${teams.length} teams.`)
  }

  private async upsertTournaments(
    tournaments: NormalizedTournament[]
  ): Promise<void> {
    if (tournaments.length === 0) return

    const result = await prisma.tournament.createMany({
      data: tournaments.map((tournament) => ({
        id: tournament.id,
        name: tournament.name,
        startDate: tournament.startTime,
        endDate: tournament.endTime,
        leagueId: tournament.league.id,
        type: tournament.type,
      })),
      skipDuplicates: true,
    })

    console.error(`\tInserted ${result.count} new tournaments.`)
    console.error(`\tUpserted ${tournaments.length} tournaments.`)
  }

  private async upsertMatches(matches: NormalizedMatch[]): Promise<void> {
    if (matches.length === 0) return

    for (const match of matches) {
      const winnerId = match.result?.winner || null
      const isFinished = match.state === "completed"

      await prisma.$transaction(async (tx) => {
        const updatedMatch = await tx.match.upsert({
          where: { id: match.id },
          update: {
            state: match.state,
            winnerId: winnerId,
            teamAScore: match.result?.team1Score,
            teamBScore: match.result?.team2Score,
          },
          create: {
            id: match.id,
            matchDate: new Date(match.date),
            state: match.state,
            bestOf: match.bestOf,
            stage: match.stage,
            tournamentId: match.tournament.id,
            teamAId: match.team1.id,
            teamBId: match.team2.id,
            winnerId: winnerId,
            teamAScore: match.result?.team1Score,
            teamBScore: match.result?.team2Score,
          },
        })

        if (isFinished && winnerId) {
          await this.settlePredictions(tx, updatedMatch)
        }
      })
    }

    console.error(`\tUpserted ${matches.length} matches.`)
  }

  private async settlePredictions(tx: any, match: any): Promise<void> {
    const predictions = await tx.prediction.findMany({
      where: { matchId: match.id, points: null },
    })

    for (const pred of predictions) {
      const isWinnerCorrect = pred.teamId === match.winnerId
      const isExactScore =
        pred.predictedTeamAScore === match.teamAScore &&
        pred.predictedTeamBScore === match.teamBScore

      let pointsEarned = 0
      if (isWinnerCorrect) {
        pointsEarned = isExactScore ? 3 : 1 // 3 for perfect, 1 for winner only
      }

      await tx.prediction.update({
        where: { id: pred.id },
        data: {
          isCorrect: isWinnerCorrect,
          isExact: isExactScore,
          points: pointsEarned,
        },
      })
    }
  }
}
