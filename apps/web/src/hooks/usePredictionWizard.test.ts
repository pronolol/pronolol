import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { usePredictionWizard, isPredictionLocked } from "./usePredictionWizard"
import type { Match, Team, MyPrediction } from "@/api/generated/models"

const makeMatch = (overrides: Partial<Match> = {}): Match => ({
  id: "match-1",
  matchDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  state: "upcoming",
  bestOf: 3,
  stage: null,
  teamA: { id: "team-a", name: "Team Alpha", tag: "TLA", logoUrl: "" },
  teamB: { id: "team-b", name: "Team Beta", tag: "TLB", logoUrl: "" },
  winner: null as unknown as Team,
  teamAScore: null,
  teamBScore: null,
  tournament: {
    id: "t1",
    name: "Spring Split",
    league: { id: "l1", name: "LEC", imageUrl: "" },
  },
  myPrediction: null as unknown as MyPrediction,
  ...overrides,
})

describe("isPredictionLocked", () => {
  it("returns false for a future match date", () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    expect(isPredictionLocked(future)).toBe(false)
  })

  it("returns true for a past match date (> 5 min ago)", () => {
    const past = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    expect(isPredictionLocked(past)).toBe(true)
  })
})

describe("usePredictionWizard", () => {
  const m1 = makeMatch({ id: "m1" })
  const m2 = makeMatch({ id: "m2" })
  const m3 = makeMatch({ id: "m3" })

  it("starts closed with no current match", () => {
    const { result } = renderHook(() => usePredictionWizard([m1, m2]))
    expect(result.current.isOpen).toBe(false)
    expect(result.current.currentMatch).toBeNull()
    expect(result.current.skippedCount).toBe(0)
  })

  it("open() filters to unpredicted matches and sets first as current", () => {
    const predicted = makeMatch({
      id: "pred",
      myPrediction: {
        matchId: "pred",
        teamId: "team-a",
        predictedTeamAScore: 2,
        predictedTeamBScore: 0,
        isCorrect: null,
        isExact: null,
        points: null,
        team: { id: "team-a", tag: "TLA", logoUrl: "" },
      },
    })
    const { result } = renderHook(() => usePredictionWizard([m1, predicted]))
    act(() => result.current.open())
    expect(result.current.isOpen).toBe(true)
    expect(result.current.currentMatch?.id).toBe("m1")
    expect(result.current.progress.total).toBe(1)
  })

  it("open() does nothing when all matches are predicted/locked", () => {
    const locked = makeMatch({
      id: "locked",
      matchDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    })
    const { result } = renderHook(() => usePredictionWizard([locked]))
    act(() => result.current.open())
    expect(result.current.isOpen).toBe(false)
  })

  it("advance() moves to the next match", () => {
    const { result } = renderHook(() => usePredictionWizard([m1, m2]))
    act(() => result.current.open())
    expect(result.current.currentMatch?.id).toBe("m1")
    act(() => result.current.advance())
    expect(result.current.currentMatch?.id).toBe("m2")
    expect(result.current.progress.done).toBe(1)
  })

  it("advance() past end with no skips → done phase", () => {
    const { result } = renderHook(() => usePredictionWizard([m1]))
    act(() => result.current.open())
    act(() => result.current.advance())
    expect(result.current.phase).toBe("done")
    expect(result.current.currentMatch).toBeNull()
  })

  it("skip() adds to skippedIds and advances", () => {
    const { result } = renderHook(() => usePredictionWizard([m1, m2]))
    act(() => result.current.open())
    act(() => result.current.skip())
    expect(result.current.currentMatch?.id).toBe("m2")
    expect(result.current.skippedCount).toBe(1)
  })

  it("skip loop-back: after all non-skipped done → review-skipped phase", () => {
    const { result } = renderHook(() => usePredictionWizard([m1, m2]))
    act(() => result.current.open())
    act(() => result.current.skip()) // skip m1, advance to m2
    act(() => result.current.advance()) // complete m2, end of queue
    expect(result.current.phase).toBe("review-skipped")
    expect(result.current.skippedCount).toBe(1)
    expect(result.current.currentMatch).toBeNull()
  })

  it("startReview() restarts queue with only skipped matches", () => {
    const { result } = renderHook(() => usePredictionWizard([m1, m2, m3]))
    act(() => result.current.open())
    act(() => result.current.skip()) // skip m1
    act(() => result.current.advance()) // complete m2
    act(() => result.current.advance()) // complete m3 → review-skipped
    act(() => result.current.startReview())
    expect(result.current.phase).toBe("predicting")
    expect(result.current.currentMatch?.id).toBe("m1")
    expect(result.current.progress.total).toBe(1)
    expect(result.current.skippedCount).toBe(0)
  })

  it("close() resets all state", () => {
    const { result } = renderHook(() => usePredictionWizard([m1, m2]))
    act(() => result.current.open())
    act(() => result.current.skip())
    act(() => result.current.close())
    expect(result.current.isOpen).toBe(false)
    expect(result.current.currentMatch).toBeNull()
    expect(result.current.skippedCount).toBe(0)
    expect(result.current.progress).toEqual({ done: 0, total: 0 })
  })

  it("open() excludes completed matches", () => {
    const completed = makeMatch({ id: "done", state: "completed" })
    const { result } = renderHook(() => usePredictionWizard([completed, m1]))
    act(() => result.current.open())
    expect(result.current.progress.total).toBe(1)
    expect(result.current.currentMatch?.id).toBe("m1")
  })
})
