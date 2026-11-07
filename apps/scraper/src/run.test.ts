import { describe, it, expect, vi, beforeEach } from "vitest"
import { runScrape, RunScrapeDeps } from "./run"
import { sendHeartbeat } from "./services/heartbeat"
import type { ScraperOutput } from "./types"

vi.mock("./services/heartbeat", () => ({ sendHeartbeat: vi.fn() }))

const makeOutput = (): ScraperOutput =>
  ({
    leagues: [],
    teams: [],
    tournaments: [],
    matches: [],
    metadata: { dateRange: { start: "2026-01-01", end: "2026-01-31" } },
  }) as unknown as ScraperOutput

const makeDeps = (overrides: Partial<RunScrapeDeps> = {}): RunScrapeDeps => ({
  fetcher: { fetchData: vi.fn().mockResolvedValue({}) },
  parser: { parse: vi.fn().mockReturnValue(makeOutput()) },
  dbService: { saveScrapedData: vi.fn().mockResolvedValue(undefined) },
  leagues: ["lec"],
  save: true,
  ...overrides,
})

describe("runScrape", () => {
  beforeEach(() => {
    vi.mocked(sendHeartbeat).mockReset()
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("fetches, parses, saves and then reports up", async () => {
    const deps = makeDeps()

    const result = await runScrape(deps)

    expect(deps.fetcher.fetchData).toHaveBeenCalledWith(["lec"])
    expect(deps.dbService.saveScrapedData).toHaveBeenCalledWith(result)
    expect(sendHeartbeat).toHaveBeenCalledTimes(1)
    expect(sendHeartbeat).toHaveBeenCalledWith("up", expect.any(String))
  })

  it("reports down and rethrows when saving to the database fails", async () => {
    const deps = makeDeps({
      dbService: {
        saveScrapedData: vi.fn().mockRejectedValue(new Error("DB unreachable")),
      },
    })

    await expect(runScrape(deps)).rejects.toThrow("DB unreachable")

    expect(sendHeartbeat).toHaveBeenCalledTimes(1)
    expect(sendHeartbeat).toHaveBeenCalledWith("down", "DB unreachable")
  })

  it("reports down and rethrows when fetching fails", async () => {
    const deps = makeDeps({
      fetcher: { fetchData: vi.fn().mockRejectedValue(new Error("timeout")) },
    })

    await expect(runScrape(deps)).rejects.toThrow("timeout")

    expect(deps.dbService.saveScrapedData).not.toHaveBeenCalled()
    expect(sendHeartbeat).toHaveBeenCalledWith("down", "timeout")
  })

  it("skips the database and still reports up with save disabled", async () => {
    const deps = makeDeps({ save: false })

    await runScrape(deps)

    expect(deps.dbService.saveScrapedData).not.toHaveBeenCalled()
    expect(sendHeartbeat).toHaveBeenCalledWith("up", expect.any(String))
  })

  it("reports down with a generic message for non-Error throws", async () => {
    const deps = makeDeps({
      parser: {
        parse: vi.fn().mockImplementation(() => {
          throw "boom"
        }),
      },
    })

    await expect(runScrape(deps)).rejects.toBe("boom")

    expect(sendHeartbeat).toHaveBeenCalledWith("down", "boom")
  })
})
