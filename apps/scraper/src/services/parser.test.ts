import { describe, it, expect } from "vitest"
import { ParserService, RawApiData } from "./parser"
import { HomeEvent, HomeEventMatch, GetSeasonForNavigation } from "../types"

// ─── Factories ────────────────────────────────────────────────────────────────

const makeHomeEvent = (events: HomeEventMatch[]): HomeEvent => {
  return {
    data: {
      __typename: "Query",
      esports: {
        __typename: "EsportsData",
        events,
        pages: { __typename: "Pages", newer: null, older: null },
      },
    },
  }
}

const makeMatch = (
  id: string,
  team1Id: string,
  team2Id: string,
  overrides: Partial<HomeEventMatch> = {}
): HomeEventMatch => {
  return {
    __typename: "EventMatch",
    id,
    blockName: "Regular Season",
    startTime: "2026-01-15T18:00:00Z",
    state: "completed",
    streams: [],
    league: {
      __typename: "League",
      id: "league-1",
      name: "LEC",
      slug: "lec",
      image: "lec-logo.png",
      displayPriority: {
        __typename: "Priority",
        position: 1,
        status: "selected",
      },
    },
    tournament: {
      __typename: "Tournament",
      id: "tournament-1",
      name: "Spring Split",
    },
    match: {
      __typename: "Match",
      id,
      state: "completed",
      flags: [],
      games: [],
      strategy: { __typename: "MatchStrategy", count: 3, type: "bestOf" },
      type: "normal",
    },
    matchTeams: [
      {
        __typename: "MatchTeam",
        id: `team:${team1Id}`,
        code: "G2",
        name: "G2 Esports",
        image: "g2-logo.png",
        lightImage: null,
        result: { __typename: "TeamResult", outcome: "win", gameWins: 2 },
      },
      {
        __typename: "MatchTeam",
        id: `team:${team2Id}`,
        code: "FNC",
        name: "Fnatic",
        image: "fnc-logo.png",
        lightImage: null,
        result: { __typename: "TeamResult", outcome: "loss", gameWins: 1 },
      },
    ],
    ...overrides,
  }
}

const makeSeasonNav = (tournamentId: string): GetSeasonForNavigation => {
  return {
    data: {
      __typename: "Query",
      seasons: [
        {
          __typename: "Season",
          description: "2026 Season",
          splits: [
            {
              __typename: "Split",
              id: "split-1",
              name: "Spring",
              slug: "spring",
              region: "EMEA",
              startTime: "2026-01-01T00:00:00Z",
              endTime: "2026-06-01T00:00:00Z",
              tournaments: [
                {
                  __typename: "Tournament",
                  id: tournamentId,
                  name: "LEC Spring 2026",
                  startTime: "2026-01-15T00:00:00Z",
                  endTime: "2026-04-30T00:00:00Z",
                  region: "EMEA",
                  league: {
                    __typename: "League",
                    id: "league-1",
                    name: "LEC",
                    image: "lec-logo.png",
                    region: "EMEA",
                    regionSlug: "emea",
                    displayPriority: {
                      __typename: "Priority",
                      position: 1,
                      status: "selected",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  }
}

const makeRawData = (
  events: HomeEventMatch[],
  tournamentId = "tournament-1"
): RawApiData => {
  return {
    homeEvents: [makeHomeEvent(events)],
    GetSeasonForNavigation: [makeSeasonNav(tournamentId)],
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ParserService", () => {
  const parser = new ParserService()

  it("returns empty matches when there are no events", () => {
    const output = parser.parse(makeRawData([]))
    expect(output.matches).toHaveLength(0)
  })

  it("parses a single match correctly", () => {
    const output = parser.parse(makeRawData([makeMatch("m1", "g2", "fnc")]))

    expect(output.matches).toHaveLength(1)
    const match = output.matches[0]
    expect(match.id).toBe("m1")
    expect(match.bestOf).toBe(3)
    expect(match.state).toBe("completed")
    expect(match.stage).toBe("Regular Season")
    expect(match.league).toMatchObject({ id: "league-1", name: "LEC" })
    expect(match.tournament).toMatchObject({ id: "tournament-1" })
  })

  it("strips the 'team:' prefix from team IDs", () => {
    const output = parser.parse(
      makeRawData([makeMatch("m1", "g2-id", "fnc-id")])
    )
    const { team1, team2 } = output.matches[0]
    expect([team1.id, team2.id]).not.toContain(expect.stringContaining("team:"))
  })

  it("sorts teams by ID for consistent ordering across scrapes", () => {
    // 'aaa' < 'zzz' → aaa should always be team1 regardless of API order
    const output = parser.parse(makeRawData([makeMatch("m1", "aaa", "zzz")]))
    expect(output.matches[0].team1.id).toBe("aaa")
    expect(output.matches[0].team2.id).toBe("zzz")
  })

  it("filters out matches where either team is TBD", () => {
    const tbdMatch = makeMatch("m1", "g2", "fnc")
    tbdMatch.matchTeams[1].code = "TBD"
    const output = parser.parse(makeRawData([tbdMatch]))
    expect(output.matches).toHaveLength(0)
  })

  it("filters out matches belonging to unknown tournaments", () => {
    // Match references tournament-1 but season nav only has tournament-OTHER
    const output = parser.parse(
      makeRawData([makeMatch("m1", "g2", "fnc")], "tournament-OTHER")
    )
    expect(output.matches).toHaveLength(0)
  })

  it("extracts tournaments and leagues from season navigation", () => {
    const output = parser.parse(makeRawData([makeMatch("m1", "g2", "fnc")]))
    expect(output.tournaments).toHaveLength(1)
    expect(output.tournaments[0]).toMatchObject({
      id: "tournament-1",
      name: "LEC Spring 2026",
    })
    expect(output.leagues.length).toBeGreaterThan(0)
  })

  it("collects unique teams from all matches", () => {
    const output = parser.parse(
      makeRawData([makeMatch("m1", "g2", "fnc"), makeMatch("m2", "t1", "c9")])
    )
    // 4 unique teams across 2 matches
    expect(output.teams).toHaveLength(4)
  })

  it("computes the date range from match start times", () => {
    const early = makeMatch("m1", "g2", "fnc")
    early.startTime = "2026-01-10T18:00:00Z"

    const late = makeMatch("m2", "t1", "c9")
    late.startTime = "2026-01-20T18:00:00Z"

    const output = parser.parse(makeRawData([early, late]))
    expect(output.metadata.dateRange.start).toBe(
      new Date("2026-01-10T18:00:00Z").toISOString()
    )
    expect(output.metadata.dateRange.end).toBe(
      new Date("2026-01-20T18:00:00Z").toISOString()
    )
  })

  it("sets both dateRange bounds to now when there are no matches", () => {
    const before = Date.now()
    const output = parser.parse(makeRawData([]))
    const after = Date.now()

    const start = new Date(output.metadata.dateRange.start).getTime()
    expect(start).toBeGreaterThanOrEqual(before)
    expect(start).toBeLessThanOrEqual(after)
  })
})
