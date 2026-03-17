import { vi, describe, it, expect, beforeEach } from "vitest"
import {
  getUserPreferences,
  upsertUserPreferences,
} from "./preferences.service"

const mockFindUnique = vi.fn()
const mockUpsert = vi.fn()

vi.mock("@pronolol/database", () => ({
  prisma: {
    userPreferences: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
  },
}))

describe("getUserPreferences", () => {
  beforeEach(() => {
    mockFindUnique.mockReset()
  })

  it("returns null for both fields when no preferences row exists", async () => {
    mockFindUnique.mockResolvedValueOnce(null)
    const result = await getUserPreferences("user-1")
    expect(result).toEqual({ leagueId: null, tournamentId: null })
  })

  it("returns the stored leagueId and tournamentId", async () => {
    mockFindUnique.mockResolvedValueOnce({
      leagueId: "league-abc",
      tournamentId: "tournament-xyz",
    })
    const result = await getUserPreferences("user-1")
    expect(result).toEqual({
      leagueId: "league-abc",
      tournamentId: "tournament-xyz",
    })
  })

  it("returns null for a field that is stored as null", async () => {
    mockFindUnique.mockResolvedValueOnce({
      leagueId: "league-abc",
      tournamentId: null,
    })
    const result = await getUserPreferences("user-1")
    expect(result).toEqual({ leagueId: "league-abc", tournamentId: null })
  })
})

describe("upsertUserPreferences", () => {
  beforeEach(() => {
    mockUpsert.mockReset()
  })

  it("creates new preferences when none exist", async () => {
    mockUpsert.mockResolvedValueOnce({
      leagueId: "league-1",
      tournamentId: "tournament-1",
    })
    const result = await upsertUserPreferences("user-1", {
      leagueId: "league-1",
      tournamentId: "tournament-1",
    })
    expect(result).toEqual({
      leagueId: "league-1",
      tournamentId: "tournament-1",
    })
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        create: expect.objectContaining({
          userId: "user-1",
          leagueId: "league-1",
          tournamentId: "tournament-1",
        }),
      })
    )
  })

  it("only updates leagueId when tournamentId is not provided", async () => {
    mockUpsert.mockResolvedValueOnce({
      leagueId: "league-2",
      tournamentId: null,
    })
    await upsertUserPreferences("user-1", { leagueId: "league-2" })
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ leagueId: "league-2" }),
      })
    )
    const updateArg = mockUpsert.mock.calls[0][0].update
    expect(updateArg).not.toHaveProperty("tournamentId")
  })

  it("only updates tournamentId when leagueId is not provided", async () => {
    mockUpsert.mockResolvedValueOnce({
      leagueId: null,
      tournamentId: "tournament-3",
    })
    await upsertUserPreferences("user-1", { tournamentId: "tournament-3" })
    const updateArg = mockUpsert.mock.calls[0][0].update
    expect(updateArg).toHaveProperty("tournamentId", "tournament-3")
    expect(updateArg).not.toHaveProperty("leagueId")
  })

  it("stores null values when explicitly set to null", async () => {
    mockUpsert.mockResolvedValueOnce({ leagueId: null, tournamentId: null })
    const result = await upsertUserPreferences("user-1", {
      leagueId: null,
      tournamentId: null,
    })
    expect(result).toEqual({ leagueId: null, tournamentId: null })
    const updateArg = mockUpsert.mock.calls[0][0].update
    expect(updateArg).toMatchObject({ leagueId: null, tournamentId: null })
  })
})
