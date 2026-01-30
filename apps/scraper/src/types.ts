/**
 * TypeScript types for LoL Esports API data structures
 */

// Team types
export interface Team {
  id: string
  slug: string
  name: string
  code: string // Short tag (e.g., "G2", "T1", "FNC")
  image: string // Logo URL
}

// League types
export interface League {
  id: string
  slug: string
  name: string
  region: string
  image?: string
}

// Tournament/Event types
export interface Tournament {
  id: string
  slug: string
  name: string // e.g., "Système suisse", "Quarts de finale", "Regular Season"
  startDate: string
  endDate: string
}

// Match types
export type MatchState = "unstarted" | "inProgress" | "completed"
export type MatchStrategy = "bestOf" // Best of 1, 3, 5, etc.

export interface MatchTeam {
  id: string
  name: string
  code: string
  image: string
  lightImage?: string | null
  result?: {
    outcome: "win" | "loss" | null
    gameWins: number
  }
}

export interface Match {
  id: string
  state: MatchState
  strategy: {
    type: MatchStrategy
    count: number // Best of X
  }
  type: string
  flags: string[]
  games: Array<{
    id: string
    number: number
    state: MatchState
    vods: any[]
    recaps: any[]
  }>
}

// API Response types
export interface HomeEventsResponse {
  data: {
    events: Event[]
  }
}

export interface LeaguesResponse {
  data: {
    leagues: League[]
  }
}

// GraphQL Query Variables
export interface HomeEventsVariables {
  hl: string // Language/locale (e.g., "en-US", "fr-FR")
  sport: string // "lol"
  leagues?: string[] // League IDs to filter
  eventDateStart?: string // ISO date string
  eventDateEnd?: string // ISO date string
  eventState?: MatchState[]
  eventType?: "match" | "show" | "all"
  pageSize?: number
}

// Processed/Normalized types for easier consumption
export interface NormalizedTeam {
  id: string
  name: string
  tag: string
  logo: string
}

export interface NormalizedMatch {
  id: string
  date: string
  state: MatchState
  bestOf: number
  team1: NormalizedTeam
  team2: NormalizedTeam
  result?: {
    winner?: string // Team ID
    team1Score: number
    team2Score: number
  }
  league: {
    id: string
    name: string
    slug: string
  }
  tournament: {
    id: string
    name: string
    startDate?: string
    endDate?: string
  }
  stage: string
}

export interface NormalizedLeague {
  id: string
  name: string
  regionSlug: string
  region: string
  image: string
}

export interface NormalizedTournament {
  id: string
  name: string
  startTime?: string
  endTime?: string
  league: NormalizedLeague
  type: string // Tournament type/stage
}

// Scraper output format
export interface ScraperOutput {
  leagues: NormalizedLeague[]
  teams: NormalizedTeam[]
  matches: NormalizedMatch[]
  tournaments: NormalizedTournament[]
  metadata: {
    scrapedAt: string
    dateRange: {
      start: string
      end: string
    }
  }
}

// START: Generated types from output/test.json

export type Event = HomeEvent | GetSeasonForNavigation | GetPickemsLeaguesSimple

// Types for HomeEvents
export interface HomeEvent {
  data: {
    __typename: "Query"
    esports: {
      __typename: "EsportsData"
      events: HomeEventMatch[]
      pages: {
        __typename: "Pages"
        newer: string | null
        older: string | null
      }
    }
  }
}

export interface HomeEventMatch {
  __typename: "EventMatch"
  blockName: string
  id: string
  league: EventLeague
  match: EventMatchDetails
  matchTeams: EventMatchTeam[]
  startTime: string
  state: string
  streams: any[]
  tournament: EventTournament
  type: string
}

export interface EventLeague {
  __typename: "League"
  displayPriority: DisplayPriority
  id: string
  image: string
  name: string
  slug: string
}

export interface DisplayPriority {
  __typename: "Priority"
  position: number
  status: string
}

export interface EventMatchDetails {
  __typename: "Match"
  flags: string[]
  games: EventGame[]
  id: string
  state: string
  strategy: MatchStrategyInfo
  type: string
}

export interface EventGame {
  __typename: "Game"
  id: string
  number: number
  state: string
  vods: MainVod[]
  recaps: any[]
}

export interface MainVod {
  __typename: "MainVod"
  endMillis: number
  id: string
  parameter: string
  startMillis: number
}

export interface MatchStrategyInfo {
  __typename: "MatchStrategy"
  count: number
  type: string
}

export interface EventMatchTeam {
  __typename: "MatchTeam"
  code: string
  id: string
  image: string
  lightImage: string | null
  name: string
  result: TeamResult
}

export interface TeamResult {
  __typename: "TeamResult"
  gameWins: number
  outcome: string
}

export interface EventTournament {
  __typename: "Tournament"
  id: string
  name: string
}

// Types for GetSeasonForNavigation
export interface GetSeasonForNavigation {
  data: {
    __typename: "Query"
    seasons: Season[]
  }
}

export interface Season {
  __typename: "Season"
  description: string
  splits: Split[]
}

export interface Split {
  __typename: "Split"
  endTime: string
  id: string
  name: string
  region: string
  slug: string
  startTime: string
  tournaments: SeasonTournament[]
}

export interface SeasonTournament {
  __typename: "Tournament"
  endTime: string
  id: string
  league: SeasonLeague
  name: string
  startTime: string
  region: string
}

export interface SeasonLeague {
  __typename: "League"
  displayPriority: DisplayPriority
  id: string
  image: string
  name: string
  region: string
  regionSlug: string
}

// Types for GetPickemsLeaguesSimple
export interface GetPickemsLeaguesSimple {
  data: {
    __typename: "Query"
    pickemLeagues: PickemLeague[]
  }
}

export interface PickemLeague {
  __typename: "League"
  hl: string
  id: string
  name: string
  pickemTournaments: PickemTournament[]
  slug: string
  sport: string
}

export interface PickemTournament {
  __typename: "Tournament"
  endTime: string
  hl: string
  id: string
  name: string
  pickemTournamentConfig: PickemTournamentConfig
  startTime: string
  state: string
}

export interface PickemTournamentConfig {
  __typename: "PickemTournamentConfig"
  pickemCloseTime: string
  pickemOpenTime: string
}

// END: Generated types from output/test.json
