import { describe, it, expect } from "vitest"
import type { RankingFilterLeague } from "@/api/generated/models"
import { buildLeagueOptions, buildTournamentOptions } from "./ranking-filters"

const makeLeague = (
  id: string,
  name: string,
  tournaments: { id: string; name: string }[] = []
): RankingFilterLeague => ({ id, name, tournaments })

const leagues = [
  makeLeague("lec", "LEC", [
    { id: "lec-summer", name: "Summer Split" },
    { id: "lec-spring", name: "Spring Split" },
  ]),
  makeLeague("lck", "LCK", [{ id: "lck-spring", name: "Spring Split" }]),
]

describe("buildLeagueOptions", () => {
  it("returns only the 'All Leagues' option when there are no leagues", () => {
    expect(buildLeagueOptions([])).toEqual([
      { label: "All Leagues", value: null },
    ])
  })

  it("lists every league after the 'All Leagues' option, preserving order", () => {
    expect(buildLeagueOptions(leagues)).toEqual([
      { label: "All Leagues", value: null },
      { label: "LEC", value: "lec" },
      { label: "LCK", value: "lck" },
    ])
  })
})

describe("buildTournamentOptions", () => {
  it("returns only the 'All Tournaments' option when there are no leagues", () => {
    expect(buildTournamentOptions([], null)).toEqual([
      { label: "All Tournaments", value: null },
    ])
  })

  it("lists every tournament prefixed with its league when no league is selected", () => {
    expect(buildTournamentOptions(leagues, null)).toEqual([
      { label: "All Tournaments", value: null },
      { label: "LEC — Summer Split", value: "lec-summer" },
      { label: "LEC — Spring Split", value: "lec-spring" },
      { label: "LCK — Spring Split", value: "lck-spring" },
    ])
  })

  it("lists only the selected league's tournaments, without prefix", () => {
    expect(buildTournamentOptions(leagues, "lck")).toEqual([
      { label: "All Tournaments", value: null },
      { label: "Spring Split", value: "lck-spring" },
    ])
  })

  it("falls back to 'All Tournaments' for an unknown league", () => {
    expect(buildTournamentOptions(leagues, "unknown")).toEqual([
      { label: "All Tournaments", value: null },
    ])
  })
})
