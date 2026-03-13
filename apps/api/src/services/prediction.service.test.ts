import { vi, describe, it, expect, beforeEach } from "vitest"
import { isPredictionLocked, validatePrediction, getMatchPredictions } from "./prediction.service"

const mockFindUnique = vi.fn()
const mockFindMany = vi.fn()

vi.mock("@pronolol/database", () => ({
  prisma: {
    prediction: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}))

describe("isPredictionLocked", () => {
  it("returns false when match has not started yet", () => {
    const future = new Date(Date.now() + 60 * 60 * 1000)
    expect(isPredictionLocked(future)).toBe(false)
  })

  it("returns false within the 5-minute window after kick-off", () => {
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000)
    expect(isPredictionLocked(threeMinutesAgo)).toBe(false)
  })

  it("returns true once the 5-minute window has passed", () => {
    const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000)
    expect(isPredictionLocked(sixMinutesAgo)).toBe(true)
  })

  it("returns true exactly at the lock boundary", () => {
    const justPastLock = new Date(Date.now() - 5 * 60 * 1000 - 1)
    expect(isPredictionLocked(justPastLock)).toBe(true)
  })
})

describe("validatePrediction", () => {
  const match = { teamAId: "team-a", teamBId: "team-b", bestOf: 3 }

  describe("valid predictions", () => {
    it("accepts BO3 with teamA winning 2-0", () => {
      expect(
        validatePrediction(
          { teamId: "team-a", predictedTeamAScore: 2, predictedTeamBScore: 0 },
          match
        )
      ).toEqual({ valid: true })
    })

    it("accepts BO3 with teamB winning 2-1", () => {
      expect(
        validatePrediction(
          { teamId: "team-b", predictedTeamAScore: 1, predictedTeamBScore: 2 },
          match
        )
      ).toEqual({ valid: true })
    })

    it("accepts BO5 with teamA winning 3-2", () => {
      expect(
        validatePrediction(
          { teamId: "team-a", predictedTeamAScore: 3, predictedTeamBScore: 2 },
          { ...match, bestOf: 5 }
        )
      ).toEqual({ valid: true })
    })

    it("accepts BO1 with teamB winning 1-0", () => {
      expect(
        validatePrediction(
          { teamId: "team-b", predictedTeamAScore: 0, predictedTeamBScore: 1 },
          { ...match, bestOf: 1 }
        )
      ).toEqual({ valid: true })
    })
  })

  describe("invalid team", () => {
    it("rejects a team not part of the match", () => {
      expect(
        validatePrediction(
          { teamId: "team-c", predictedTeamAScore: 2, predictedTeamBScore: 0 },
          match
        )
      ).toEqual({ valid: false, error: "Invalid team selection" })
    })
  })

  describe("invalid scores", () => {
    it("rejects when winner does not reach the required wins (BO3: needs 2)", () => {
      const result = validatePrediction(
        { teamId: "team-a", predictedTeamAScore: 1, predictedTeamBScore: 0 },
        match
      )
      expect(result).toMatchObject({
        valid: false,
        error: expect.stringContaining("exactly 2 wins"),
      })
    })

    it("rejects when winner does not reach the required wins (BO5: needs 3)", () => {
      const result = validatePrediction(
        { teamId: "team-a", predictedTeamAScore: 2, predictedTeamBScore: 1 },
        { ...match, bestOf: 5 }
      )
      expect(result).toMatchObject({
        valid: false,
        error: expect.stringContaining("exactly 3 wins"),
      })
    })

    it("rejects when loser score equals the winning threshold", () => {
      // e.g. 2-2 in a BO3: loserScore >= maxScore
      const result = validatePrediction(
        { teamId: "team-a", predictedTeamAScore: 2, predictedTeamBScore: 2 },
        match
      )
      expect(result).toMatchObject({ valid: false })
    })

    it("rejects when the selected team does not match the predicted winner", () => {
      // teamA scores more but teamB is selected
      const result = validatePrediction(
        { teamId: "team-b", predictedTeamAScore: 2, predictedTeamBScore: 0 },
        match
      )
      expect(result).toEqual({
        valid: false,
        error: "Selected team must match the predicted winner based on scores",
      })
    })
  })
})

describe("getMatchPredictions", () => {
  const userId = "user-1"
  const matchId = "match-1"
  const fakePrediction = { id: "pred-1", userId, matchId, teamId: "team-a", team: {} }
  const fakeAllPredictions = [fakePrediction, { id: "pred-2", userId: "user-2", matchId, teamId: "team-b", team: {}, user: {} }]

  const futureMatch = { matchDate: new Date(Date.now() + 60 * 60 * 1000), state: "upcoming" }
  const lockedMatch = { matchDate: new Date(Date.now() - 6 * 60 * 1000), state: "ongoing" }
  const completedMatch = { matchDate: new Date(Date.now() - 2 * 60 * 60 * 1000), state: "completed" }

  beforeEach(() => {
    mockFindUnique.mockReset()
    mockFindMany.mockReset()
  })

  it("returns allPredictions when user has predicted (match not yet locked)", async () => {
    mockFindUnique.mockResolvedValue(fakePrediction)
    mockFindMany.mockResolvedValue(fakeAllPredictions)

    const result = await getMatchPredictions(userId, matchId, futureMatch)

    expect(result.myPrediction).toEqual(fakePrediction)
    expect(result.allPredictions).toEqual(fakeAllPredictions)
    expect(mockFindMany).toHaveBeenCalledOnce()
  })

  it("returns allPredictions when match is locked even if user has not predicted", async () => {
    mockFindUnique.mockResolvedValue(null)
    mockFindMany.mockResolvedValue(fakeAllPredictions)

    const result = await getMatchPredictions(userId, matchId, lockedMatch)

    expect(result.myPrediction).toBeNull()
    expect(result.allPredictions).toEqual(fakeAllPredictions)
    expect(mockFindMany).toHaveBeenCalledOnce()
  })

  it("returns allPredictions when match is completed even if user has not predicted", async () => {
    mockFindUnique.mockResolvedValue(null)
    mockFindMany.mockResolvedValue(fakeAllPredictions)

    const result = await getMatchPredictions(userId, matchId, completedMatch)

    expect(result.myPrediction).toBeNull()
    expect(result.allPredictions).toEqual(fakeAllPredictions)
    expect(mockFindMany).toHaveBeenCalledOnce()
  })

  it("returns allPredictions = null when user has not predicted and match is not locked", async () => {
    mockFindUnique.mockResolvedValue(null)

    const result = await getMatchPredictions(userId, matchId, futureMatch)

    expect(result.myPrediction).toBeNull()
    expect(result.allPredictions).toBeNull()
    expect(mockFindMany).not.toHaveBeenCalled()
  })
})
