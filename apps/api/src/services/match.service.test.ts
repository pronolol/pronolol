import { vi, describe, it, expect, beforeEach } from "vitest"
import { getMatches } from "./match.service"

const mockFindMany = vi.fn()
const mockPredictionFindMany = vi.fn()

vi.mock("@pronolol/database", () => ({
  prisma: {
    match: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    prediction: {
      findMany: (...args: unknown[]) => mockPredictionFindMany(...args),
    },
  },
  Prisma: {},
}))

// Minimal match shape returned by prisma (includes are mocked away)
const makeMatch = (id: string, matchDate: Date) => ({
  id,
  matchDate,
  state: "upcoming",
  bestOf: 3,
  stage: null,
  teamAId: "team-a",
  teamBId: "team-b",
  winnerId: null,
  teamAScore: null,
  teamBScore: null,
  teamA: { id: "team-a", name: "Team A", tag: "TLA", logoUrl: "" },
  teamB: { id: "team-b", name: "Team B", tag: "TLB", logoUrl: "" },
  winner: null,
  tournament: {
    id: "t1",
    name: "Spring",
    league: { id: "l1", name: "LEC", imageUrl: "" },
  },
})

const makeMatches = (count: number, baseDate = new Date(), offsetMs = 60_000) =>
  Array.from({ length: count }, (_, i) =>
    makeMatch(`match-${i}`, new Date(baseDate.getTime() + i * offsetMs))
  )

describe("getMatches", () => {
  beforeEach(() => {
    mockFindMany.mockReset()
    mockPredictionFindMany.mockReset()
  })

  // ─── direction: around ────────────────────────────────────────────────────

  describe('direction: "around"', () => {
    it("returns before matches (chronological) followed by after matches", async () => {
      const cursor = new Date("2025-06-01T12:00:00Z")
      // before query returns desc (newest-first): [p2, p1]
      const past = [
        makeMatch("p2", new Date("2025-06-01T11:30:00Z")),
        makeMatch("p1", new Date("2025-06-01T10:00:00Z")),
      ]
      // after query returns asc: [f1, f2]
      const future = [
        makeMatch("f1", new Date("2025-06-01T13:00:00Z")),
        makeMatch("f2", new Date("2025-06-01T14:00:00Z")),
      ]

      mockFindMany.mockResolvedValueOnce(past).mockResolvedValueOnce(future)

      const result = await getMatches({
        direction: "around",
        cursor: cursor.toISOString(),
        limit: 4,
      })

      // before reversed → [p1, p2], then after → [f1, f2]
      expect(result.map((m) => m.id)).toEqual(["p1", "p2", "f1", "f2"])
    })

    it("compensates by taking more from before when after is short", async () => {
      // limit=20, halfLimit=10; only 3 future matches available
      // Expected: afterCount=3, beforeCount=17, total=20
      const past = makeMatches(20, new Date("2025-05-01"), -60_000) // 20 past
      const future = makeMatches(3, new Date("2025-06-02")) // only 3 future

      mockFindMany.mockResolvedValueOnce(past).mockResolvedValueOnce(future)

      const result = await getMatches({
        direction: "around",
        cursor: new Date("2025-06-01").toISOString(),
        limit: 20,
      })

      expect(result).toHaveLength(20)
      // Last 3 items should be the future matches
      expect(result.slice(-3).map((m) => m.id)).toEqual(future.map((m) => m.id))
    })

    it("compensates by taking more from after when before is short", async () => {
      // limit=20, halfLimit=10; only 5 past matches available
      // Expected: afterCount=15, beforeCount=5, total=20
      const past = makeMatches(5, new Date("2025-05-01")) // only 5 past
      const future = makeMatches(20, new Date("2025-06-02")) // 20 future

      mockFindMany.mockResolvedValueOnce(past).mockResolvedValueOnce(future)

      const result = await getMatches({
        direction: "around",
        cursor: new Date("2025-06-01").toISOString(),
        limit: 20,
      })

      expect(result).toHaveLength(20)
      // First 5 items come from past
      expect(result.slice(0, 5).map((m) => m.id)).toEqual(
        [...past].reverse().map((m) => m.id)
      )
    })

    it("returns all available items when total is less than limit", async () => {
      // Only 3 past and 4 future → 7 total < limit(20)
      const past = makeMatches(3, new Date("2025-05-01"))
      const future = makeMatches(4, new Date("2025-06-02"))

      mockFindMany.mockResolvedValueOnce(past).mockResolvedValueOnce(future)

      const result = await getMatches({
        direction: "around",
        cursor: new Date("2025-06-01").toISOString(),
        limit: 20,
      })

      expect(result).toHaveLength(7)
    })
  })

  // ─── direction: after ─────────────────────────────────────────────────────

  describe('direction: "after"', () => {
    it("queries with gt (exclusive cursor) so the cursor match is not re-fetched", async () => {
      const cursor = new Date("2025-06-01T12:00:00Z")
      mockFindMany.mockResolvedValue([])

      await getMatches({ direction: "after", cursor: cursor.toISOString() })

      const [query] = mockFindMany.mock.calls[0] as [
        { where: { matchDate: unknown } },
      ][]
      expect(query.where.matchDate).toEqual({ gt: cursor })
    })

    it("returns matches in ascending order", async () => {
      const matches = makeMatches(3, new Date("2025-06-02"))
      mockFindMany.mockResolvedValue(matches)

      const result = await getMatches({
        direction: "after",
        cursor: new Date("2025-06-01").toISOString(),
      })

      expect(result.map((m) => m.id)).toEqual(matches.map((m) => m.id))
    })
  })

  // ─── direction: before ────────────────────────────────────────────────────

  describe('direction: "before"', () => {
    it("queries with lt (exclusive cursor) so the cursor match is not re-fetched", async () => {
      const cursor = new Date("2025-06-01T12:00:00Z")
      mockFindMany.mockResolvedValue([])

      await getMatches({ direction: "before", cursor: cursor.toISOString() })

      const [query] = mockFindMany.mock.calls[0] as [
        { where: { matchDate: unknown } },
      ][]
      expect(query.where.matchDate).toEqual({ lt: cursor })
    })

    it("returns matches in chronological order (reverses the desc db result)", async () => {
      // DB returns desc: [newest, older, oldest] → service reverses to asc
      const matches = [
        makeMatch("newest", new Date("2025-05-31T23:00:00Z")),
        makeMatch("older", new Date("2025-05-31T12:00:00Z")),
        makeMatch("oldest", new Date("2025-05-31T01:00:00Z")),
      ]
      mockFindMany.mockResolvedValue(matches)

      const result = await getMatches({
        direction: "before",
        cursor: new Date("2025-06-01").toISOString(),
      })

      expect(result.map((m) => m.id)).toEqual(["oldest", "older", "newest"])
    })
  })

  // ─── myPrediction embedding ───────────────────────────────────────────────

  describe("myPrediction embedding", () => {
    const makePrediction = (matchId: string) => ({
      matchId,
      teamId: "team-a",
      predictedTeamAScore: 2,
      predictedTeamBScore: 0,
      isCorrect: null,
      isExact: null,
      points: null,
      team: { id: "team-a", tag: "TLA", logoUrl: "" },
    })

    it("attaches null myPrediction to all matches when no userId is given", async () => {
      const matches = makeMatches(3)
      mockFindMany.mockResolvedValue(matches)

      const result = await getMatches({ direction: "after", cursor: new Date().toISOString() })

      expect(mockPredictionFindMany).not.toHaveBeenCalled()
      result.forEach((m) => expect(m.myPrediction).toBeNull())
    })

    it("attaches the user prediction to the matching match when userId is given", async () => {
      const matches = makeMatches(3)
      mockFindMany.mockResolvedValue(matches)
      mockPredictionFindMany.mockResolvedValue([makePrediction(matches[1].id)])

      const result = await getMatches(
        { direction: "after", cursor: new Date().toISOString() },
        "user-1"
      )

      expect(result[0].myPrediction).toBeNull()
      expect(result[1].myPrediction).toMatchObject({ matchId: matches[1].id, teamId: "team-a" })
      expect(result[2].myPrediction).toBeNull()
    })

    it("fetches predictions scoped to the userId and match ids", async () => {
      const matches = makeMatches(2)
      mockFindMany.mockResolvedValue(matches)
      mockPredictionFindMany.mockResolvedValue([])

      await getMatches({ direction: "after", cursor: new Date().toISOString() }, "user-42")

      expect(mockPredictionFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: "user-42",
            matchId: { in: matches.map((m) => m.id) },
          },
        })
      )
    })

    it("attaches myPrediction for matches returned by direction: around", async () => {
      const past = [makeMatch("p1", new Date("2025-05-31T10:00:00Z"))]
      const future = [makeMatch("f1", new Date("2025-06-01T13:00:00Z"))]
      mockFindMany.mockResolvedValueOnce(past).mockResolvedValueOnce(future)
      mockPredictionFindMany.mockResolvedValue([makePrediction("f1")])

      const result = await getMatches(
        { direction: "around", cursor: new Date("2025-06-01").toISOString(), limit: 4 },
        "user-1"
      )

      expect(result.find((m) => m.id === "p1")?.myPrediction).toBeNull()
      expect(result.find((m) => m.id === "f1")?.myPrediction).toMatchObject({ matchId: "f1" })
    })
  })
})
