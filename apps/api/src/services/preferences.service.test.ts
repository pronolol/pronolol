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

  it("returns empty leagueIds when no preferences row exists", async () => {
    mockFindUnique.mockResolvedValueOnce(null)
    const result = await getUserPreferences("user-1")
    expect(result).toEqual({ leagueIds: [] })
  })

  it("returns the stored leagueIds", async () => {
    mockFindUnique.mockResolvedValueOnce({
      leagueIds: ["league-abc", "league-xyz"],
    })
    const result = await getUserPreferences("user-1")
    expect(result).toEqual({ leagueIds: ["league-abc", "league-xyz"] })
  })

  it("returns empty array when leagueIds is stored as empty", async () => {
    mockFindUnique.mockResolvedValueOnce({ leagueIds: [] })
    const result = await getUserPreferences("user-1")
    expect(result).toEqual({ leagueIds: [] })
  })
})

describe("upsertUserPreferences", () => {
  beforeEach(() => {
    mockUpsert.mockReset()
  })

  it("creates new preferences when none exist", async () => {
    mockUpsert.mockResolvedValueOnce({ leagueIds: ["league-1", "league-2"] })
    const result = await upsertUserPreferences("user-1", {
      leagueIds: ["league-1", "league-2"],
    })
    expect(result).toEqual({ leagueIds: ["league-1", "league-2"] })
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        create: expect.objectContaining({
          userId: "user-1",
          leagueIds: ["league-1", "league-2"],
        }),
      })
    )
  })

  it("updates leagueIds when provided", async () => {
    mockUpsert.mockResolvedValueOnce({ leagueIds: ["league-2"] })
    await upsertUserPreferences("user-1", { leagueIds: ["league-2"] })
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ leagueIds: ["league-2"] }),
      })
    )
  })

  it("does not update leagueIds when not provided", async () => {
    mockUpsert.mockResolvedValueOnce({ leagueIds: [] })
    await upsertUserPreferences("user-1", {})
    const updateArg = mockUpsert.mock.calls[0][0].update
    expect(updateArg).not.toHaveProperty("leagueIds")
  })

  it("stores empty array when leagueIds is set to []", async () => {
    mockUpsert.mockResolvedValueOnce({ leagueIds: [] })
    const result = await upsertUserPreferences("user-1", { leagueIds: [] })
    expect(result).toEqual({ leagueIds: [] })
    const updateArg = mockUpsert.mock.calls[0][0].update
    expect(updateArg).toMatchObject({ leagueIds: [] })
  })
})
