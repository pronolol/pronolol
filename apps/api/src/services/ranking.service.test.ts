import { vi, describe, it, expect } from "vitest"
import { computeRankings } from "./ranking.service"

vi.mock("@pronolol/database", () => ({ prisma: {}, Prisma: {} }))

const makeUser = (
  id: string,
  name: string,
  overrides: { displayUsername?: string; username?: string } = {}
) => ({
  id,
  name,
  displayUsername: overrides.displayUsername ?? null,
  username: overrides.username ?? null,
  image: null,
})

const pred = (
  user: ReturnType<typeof makeUser>,
  points: number | null,
  isCorrect: boolean | null,
  isExact: boolean | null
) => ({ user, points, isCorrect, isExact })

describe("computeRankings", () => {
  it("returns an empty array when there are no predictions", () => {
    expect(computeRankings([])).toEqual([])
  })

  it("assigns rank 1 to the user with the most points", () => {
    const rankings = computeRankings([
      pred(makeUser("alice", "Alice"), 10, true, false),
      pred(makeUser("bob", "Bob"), 5, true, false),
    ])

    expect(rankings[0]).toMatchObject({
      userId: "alice",
      rank: 1,
      totalPoints: 10,
    })
    expect(rankings[1]).toMatchObject({
      userId: "bob",
      rank: 2,
      totalPoints: 5,
    })
  })

  it("accumulates points and counts across multiple predictions for the same user", () => {
    const alice = makeUser("alice", "Alice")
    const rankings = computeRankings([
      pred(alice, 10, true, false),
      pred(alice, 5, true, true),
      pred(alice, 0, false, false),
    ])

    expect(rankings).toHaveLength(1)
    expect(rankings[0]).toMatchObject({
      totalPoints: 15,
      totalPredictions: 3,
      correctPredictions: 2,
      exactPredictions: 1,
    })
  })

  it("breaks a points tie by correctness percentage", () => {
    // Alice: 10 pts from 1 prediction → 100% correct
    // Bob:   10 pts from 2 predictions → 50% correct
    const rankings = computeRankings([
      pred(makeUser("alice", "Alice"), 10, true, false),
      pred(makeUser("bob", "Bob"), 10, true, false),
      pred(makeUser("bob", "Bob"), 0, false, false),
    ])

    expect(rankings[0].userId).toBe("alice")
    expect(rankings[1].userId).toBe("bob")
  })

  it("calculates correctnessPercentage correctly", () => {
    const alice = makeUser("alice", "Alice")
    const rankings = computeRankings([
      pred(alice, 5, true, false),
      pred(alice, 5, true, false),
      pred(alice, 0, false, false),
      pred(alice, 0, false, false),
    ])

    expect(rankings[0].correctnessPercentage).toBe(50)
  })

  it("returns 0% correctness when no predictions are correct", () => {
    const rankings = computeRankings([
      pred(makeUser("alice", "Alice"), 0, false, false),
    ])

    expect(rankings[0].correctnessPercentage).toBe(0)
  })

  it("treats null points as 0", () => {
    const rankings = computeRankings([
      pred(makeUser("alice", "Alice"), null, null, null),
    ])

    expect(rankings[0].totalPoints).toBe(0)
  })

  it("prefers displayUsername over username over name for the display name", () => {
    const user = makeUser("u1", "Full Name", {
      displayUsername: "DisplayUser",
      username: "username123",
    })
    expect(computeRankings([pred(user, 5, true, false)])[0].displayName).toBe(
      "DisplayUser"
    )
  })

  it("falls back to username when displayUsername is absent", () => {
    const user = makeUser("u1", "Full Name", { username: "username123" })
    expect(computeRankings([pred(user, 5, true, false)])[0].displayName).toBe(
      "username123"
    )
  })

  it("falls back to name when neither displayUsername nor username are set", () => {
    const user = makeUser("u1", "Full Name")
    expect(computeRankings([pred(user, 5, true, false)])[0].displayName).toBe(
      "Full Name"
    )
  })
})
