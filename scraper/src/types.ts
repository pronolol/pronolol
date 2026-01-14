/**
 * TypeScript types for LoL Esports API data structures
 */

// Team types
export interface Team {
  id: string;
  slug: string;
  name: string;
  code: string; // Short tag (e.g., "G2", "T1", "FNC")
  image: string; // Logo URL
}

// League types
export interface League {
  id: string;
  slug: string;
  name: string;
  region: string;
  image?: string;
}

// Tournament/Event types
export interface Tournament {
  id: string;
  slug: string;
  name: string; // e.g., "Système suisse", "Quarts de finale", "Regular Season"
  startDate: string;
  endDate: string;
}

// Match types
export type MatchState = "unstarted" | "inProgress" | "completed";
export type MatchStrategy = "bestOf"; // Best of 1, 3, 5, etc.

export interface MatchTeam {
  id: string;
  name: string;
  code: string;
  image: string;
  lightImage?: string | null;
  result?: {
    outcome: "win" | "loss" | null;
    gameWins: number;
  };
}

export interface Match {
  id: string;
  state: MatchState;
  strategy: {
    type: MatchStrategy;
    count: number; // Best of X
  };
  type: string;
  flags: string[];
  games: Array<{
    id: string;
    number: number;
    state: MatchState;
    vods: any[];
    recaps: any[];
  }>;
}

// Event types (from lolesports API)
export interface Event {
  __typename: string;
  id: string;
  type: "match" | "show";
  tournament: {
    __typename: string;
    id: string;
    name: string;
  };
  league: {
    __typename: string;
    id: string;
    slug: string;
    name: string;
    image: string;
    displayPriority?: {
      __typename: string;
      position: number;
      status: string;
    };
  };
  match: Match;
  matchTeams: MatchTeam[];
  startTime: string;
  state: MatchState;
  blockName: string;
  streams: any[];
}

// API Response types
export interface HomeEventsResponse {
  data: {
    schedule: {
      events: Event[];
    };
  };
}

export interface LeaguesResponse {
  data: {
    leagues: League[];
  };
}

// GraphQL Query Variables
export interface HomeEventsVariables {
  hl: string; // Language/locale (e.g., "en-US", "fr-FR")
  sport: string; // "lol"
  leagues?: string[]; // League IDs to filter
  eventDateStart?: string; // ISO date string
  eventDateEnd?: string; // ISO date string
  eventState?: MatchState[];
  eventType?: "match" | "show" | "all";
  pageSize?: number;
}

// Processed/Normalized types for easier consumption
export interface NormalizedTeam {
  id: string;
  name: string;
  tag: string;
  logo: string;
  slug?: string;
}

export interface NormalizedMatch {
  id: string;
  date: string;
  state: MatchState;
  bestOf: number;
  team1: NormalizedTeam;
  team2: NormalizedTeam;
  result?: {
    winner?: string; // Team ID
    score: string; // e.g., "2-1"
  };
  league: {
    id: string;
    name: string;
    slug: string;
  };
  tournament: {
    id: string;
    name: string;
    stage?: string; // e.g., "Quarts de finale", "Système suisse"
    startDate?: string;
    endDate?: string;
  };
}

export interface NormalizedLeague {
  id: string;
  name: string;
  slug: string;
  region: string;
  image?: string;
}

export interface NormalizedTournament {
  id: string;
  name: string;
  startTime?: string;
  endTime?: string;
  league: NormalizedLeague;
  type: string; // Tournament type/stage
}

// Scraper output format
export interface ScraperOutput {
  leagues: NormalizedLeague[];
  teams: NormalizedTeam[];
  matches: NormalizedMatch[];
  tournaments: NormalizedTournament[];
  metadata: {
    scrapedAt: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
}
