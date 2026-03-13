import { prisma } from "@pronolol/database"
import { CreatePredictionDto } from "../dto/prediction.dto"

export type PredictionValidationResult =
  | { valid: true }
  | { valid: false; error: string }

export const isPredictionLocked = (matchDate: Date): boolean => {
  const lockTime = new Date(matchDate.getTime() + 5 * 60 * 1000)
  return new Date() > lockTime
}

export const validatePrediction = (
  body: CreatePredictionDto,
  match: { teamAId: string; teamBId: string; bestOf: number }
): PredictionValidationResult => {
  if (body.teamId !== match.teamAId && body.teamId !== match.teamBId) {
    return { valid: false, error: "Invalid team selection" }
  }

  const maxScore = Math.ceil(match.bestOf / 2)
  const winnerScore = Math.max(
    body.predictedTeamAScore,
    body.predictedTeamBScore
  )
  const loserScore = Math.min(
    body.predictedTeamAScore,
    body.predictedTeamBScore
  )

  if (winnerScore !== maxScore) {
    return {
      valid: false,
      error: `Winner must have exactly ${maxScore} wins for a best of ${match.bestOf}`,
    }
  }

  if (loserScore >= maxScore) {
    return {
      valid: false,
      error: "Invalid score - loser cannot have winning score",
    }
  }

  const predictedWinnerId =
    body.predictedTeamAScore > body.predictedTeamBScore
      ? match.teamAId
      : match.teamBId

  if (predictedWinnerId !== body.teamId) {
    return {
      valid: false,
      error: "Selected team must match the predicted winner based on scores",
    }
  }

  return { valid: true }
}

export const upsertPrediction = async (
  userId: string,
  matchId: string,
  body: CreatePredictionDto
) => {
  return prisma.prediction.upsert({
    where: { userId_matchId: { userId, matchId } },
    update: {
      teamId: body.teamId,
      predictedTeamAScore: body.predictedTeamAScore,
      predictedTeamBScore: body.predictedTeamBScore,
    },
    create: {
      userId,
      matchId,
      teamId: body.teamId,
      predictedTeamAScore: body.predictedTeamAScore,
      predictedTeamBScore: body.predictedTeamBScore,
    },
    include: { team: true },
  })
}

export const getUserPredictions = async (userId: string) => {
  return prisma.prediction.findMany({
    where: { userId },
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
  })
}

export const getMatchPredictions = async (
  userId: string,
  matchId: string,
  match: { matchDate: Date; state: string }
) => {
  const myPrediction = await prisma.prediction.findUnique({
    where: { userId_matchId: { userId, matchId } },
    include: { team: true },
  })

  const canSeeOtherPredictions =
    !!myPrediction || isPredictionLocked(match.matchDate) || match.state === "completed"

  let allPredictions = null
  if (canSeeOtherPredictions) {
    allPredictions = await prisma.prediction.findMany({
      where: { matchId },
      include: {
        user: {
          select: {
            id: true,
            displayUsername: true,
            username: true,
            name: true,
            image: true,
          },
        },
        team: {
          select: { id: true, name: true, tag: true, logoUrl: true },
        },
      },
      orderBy: [{ points: "desc" }, { createdAt: "asc" }],
    })
  }

  return { myPrediction, allPredictions }
}
