import axios, { AxiosInstance } from "axios";
import { HomeEventsVariables, HomeEventsResponse } from "./types";

/**
 * Client for the LoL Esports GraphQL API
 * Uses persisted queries (identified by SHA256 hashes)
 */
export class LoLEsportsAPI {
  private client: AxiosInstance;
  private baseURL = "https://lolesports.com/api/gql";

  // Persisted query hashes discovered from the website
  private readonly QUERIES = {
    homeEvents:
      "7246add6f577cf30b304e651bf9e25fc6a41fe49aeafb0754c16b5778060fc0a",
    getSeasonForNavigation:
      "0d48d1f4929890f9b75b7e0d4306a6031b541316545b49ef7b8ddbeabe230e87",
    getPickemsLeaguesSimple:
      "8ae8558bc72a34ed0fd3d00a9a43408515a67af016bddd8be4ddfbbd770c71da",
  };

  // Known league IDs from the website
  public readonly LEAGUE_IDS = {
    WORLDS: "98767991325878492",
    MSI: "98767991302996019",
    LEC: "98767975604431411",
    FIRST_STAND: "113464388705111224",
  };

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        Origin: "https://lolesports.com",
        Referer: "https://lolesports.com/",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "x-api-key": "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z",
      },
    });
  }

  /**
   * Fetch events (matches and shows) for specified leagues and date range
   */
  async getHomeEvents(
    variables: HomeEventsVariables
  ): Promise<HomeEventsResponse> {
    const params = new URLSearchParams({
      operationName: "homeEvents",
      variables: JSON.stringify(variables),
      extensions: JSON.stringify({
        persistedQuery: {
          version: 1,
          sha256Hash: this.QUERIES.homeEvents,
        },
      }),
    });

    const response = await this.client.get<HomeEventsResponse>(
      `?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Fetch all matches for a date range across major leagues
   */
  async getMatches(
    options: {
      startDate?: Date;
      endDate?: Date;
      leagues?: string[];
      state?: ("unstarted" | "inProgress" | "completed")[];
    } = {}
  ): Promise<HomeEventsResponse> {
    const {
      startDate = new Date(),
      endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      leagues = Object.values(this.LEAGUE_IDS),
      state = ["unstarted", "inProgress", "completed"],
    } = options;

    return this.getHomeEvents({
      hl: "en-US",
      sport: "lol",
      leagues,
      eventDateStart: startDate.toISOString(),
      eventDateEnd: endDate.toISOString(),
      eventState: state,
      eventType: "match",
      pageSize: 500,
    });
  }

  /**
   * Fetch upcoming matches only
   */
  async getUpcomingMatches(
    daysAhead: number = 30
  ): Promise<HomeEventsResponse> {
    const now = new Date();
    const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);

    return this.getMatches({
      startDate: now,
      endDate,
      state: ["unstarted"],
    });
  }

  /**
   * Fetch completed matches for a date range
   */
  async getCompletedMatches(
    options: {
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<HomeEventsResponse> {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date(),
    } = options;

    return this.getMatches({
      startDate,
      endDate,
      state: ["completed"],
    });
  }

  /**
   * Fetch matches for a specific league
   */
  async getLeagueMatches(
    leagueId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<HomeEventsResponse> {
    return this.getMatches({
      ...options,
      leagues: [leagueId],
    });
  }

  /**
   * Get all major international tournaments (Worlds, MSI, First Stand)
   */
  async getInternationalMatches(
    options: {
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<HomeEventsResponse> {
    return this.getMatches({
      ...options,
      leagues: [
        this.LEAGUE_IDS.WORLDS,
        this.LEAGUE_IDS.MSI,
        this.LEAGUE_IDS.FIRST_STAND,
      ],
    });
  }
}

// Export singleton instance
export const api = new LoLEsportsAPI();
