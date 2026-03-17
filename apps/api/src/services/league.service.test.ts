import { vi, describe, it, expect, beforeEach } from "vitest"
import { getLeagues } from "./league.service"

const mockFindMany = vi.fn()

vi.mock("@pronolol/database", () => ({
  prisma: {
    league: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}))

const makeLeague = (
  id: string,
  name: string,
  tournaments: { id: string; name: string }[] = []
) => ({
  id,
  name,
  imageUrl: `https://example.com/${id}.png`,
  tournaments,
})

describe("getLeagues", () => {
  beforeEach(() => {
    mockFindMany.mockReset()
  })

  it("returns an empty array when no leagues exist", async () => {
    mockFindMany.mockResolvedValueOnce([])
    const result = await getLeagues()
    expect(result).toEqual([])
  })

  it("returns leagues with their tournaments", async () => {
    const leagues = [
      makeLeague("lec", "LEC", [
        { id: "t1", name: "Spring Split" },
        { id: "t2", name: "Summer Split" },
      ]),
      makeLeague("lck", "LCK", [{ id: "t3", name: "Spring Split" }]),
    ]
    mockFindMany.mockResolvedValueOnce(leagues)
    const result = await getLeagues()
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ id: "lec", name: "LEC" })
    expect(result[0].tournaments).toHaveLength(2)
    expect(result[1]).toMatchObject({ id: "lck", name: "LCK" })
    expect(result[1].tournaments).toHaveLength(1)
  })

  it("returns leagues with empty tournaments array when a league has none", async () => {
    mockFindMany.mockResolvedValueOnce([makeLeague("lec", "LEC", [])])
    const result = await getLeagues()
    expect(result[0].tournaments).toEqual([])
  })

  it("queries with tournaments sorted by startDate descending", async () => {
    mockFindMany.mockResolvedValueOnce([])
    await getLeagues()
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          tournaments: expect.objectContaining({
            orderBy: { startDate: "desc" },
          }),
        }),
        orderBy: { name: "asc" },
      })
    )
  })
})
