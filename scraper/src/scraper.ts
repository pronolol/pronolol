import { api } from "./api";
import {
  Event,
  Match,
  NormalizedTeam,
  NormalizedMatch,
  NormalizedLeague,
  NormalizedEvent,
  ScraperOutput,
} from "./types";

/**
 * Service to scrape and normalize LoL Esports data
 */
export class ScraperService {
  /**
   * Scrape all data for a date range
   */
  async scrapeAll(
    options: {
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<ScraperOutput> {
    const {
      startDate = new Date(),
      endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    } = options;

    console.log(
      `Scraping data from ${startDate.toISOString()} to ${endDate.toISOString()}...`
    );

    // Fetch all events
    const response = await api.getMatches({
      startDate,
      endDate,
    });

    const events = response.data.schedule.events;
    console.log(`Found ${events.length} events`);

    // Extract unique teams, leagues, and normalize data
    const teamsMap = new Map<string, NormalizedTeam>();
    const leaguesMap = new Map<string, NormalizedLeague>();
    const matches: NormalizedMatch[] = [];
    const tournamentEvents: NormalizedEvent[] = [];

    for (const event of events) {
      // Skip non-match events
      if (event.type !== "match" || !event.match) {
        continue;
      }

      // Extract league
      if (!leaguesMap.has(event.league.id)) {
        leaguesMap.set(event.league.id, {
          id: event.league.id,
          name: event.league.name,
          slug: event.league.slug,
          region: this.getRegionFromLeague(event.league.slug),
        });
      }

      // Extract teams
      const teams = event.match.match.teams;
      teams.forEach((team) => {
        if (!teamsMap.has(team.id)) {
          teamsMap.set(team.id, {
            id: team.id,
            name: team.name,
            tag: team.code,
            logo: team.image,
          });
        }
      });

      // Normalize match
      const normalizedMatch = this.normalizeMatch(event);
      matches.push(normalizedMatch);

      // Extract event/tournament info
      if (
        event.tournament &&
        !tournamentEvents.some((e) => e.id === event.tournament.id)
      ) {
        tournamentEvents.push({
          id: event.tournament.id,
          name: event.tournament.name,
          startDate: event.tournament.startDate,
          endDate: event.tournament.endDate,
          league: leaguesMap.get(event.league.id)!,
          type: event.blockName || event.tournament.slug,
        });
      }
    }

    return {
      leagues: Array.from(leaguesMap.values()),
      teams: Array.from(teamsMap.values()),
      matches,
      events: tournamentEvents,
      metadata: {
        scrapedAt: new Date().toISOString(),
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
    };
  }

  /**
   * Scrape only upcoming matches
   */
  async scrapeUpcoming(daysAhead: number = 30): Promise<NormalizedMatch[]> {
    console.log(`Scraping upcoming matches for the next ${daysAhead} days...`);

    const response = await api.getUpcomingMatches(daysAhead);
    const events = response.data.schedule.events;

    return events
      .filter((event) => event.type === "match" && event.match)
      .map((event) => this.normalizeMatch(event));
  }

  /**
   * Scrape completed matches
   */
  async scrapeCompleted(
    options: {
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<NormalizedMatch[]> {
    console.log("Scraping completed matches...");

    const response = await api.getCompletedMatches(options);
    const events = response.data.schedule.events;

    return events
      .filter((event) => event.type === "match" && event.match)
      .map((event) => this.normalizeMatch(event));
  }

  /**
   * Normalize a match event into a simplified format
   */
  private normalizeMatch(event: Event): NormalizedMatch {
    const match = event.match!;
    const teams = match.match.teams;
    const [team1, team2] = teams;

    // Determine winner and score if match is completed
    let result;
    if (match.state === "completed") {
      const team1Wins = team1.result?.gameWins || 0;
      const team2Wins = team2.result?.gameWins || 0;

      result = {
        winner: team1Wins > team2Wins ? team1.id : team2.id,
        score: `${team1Wins}-${team2Wins}`,
      };
    }

    return {
      id: match.id,
      date: match.startTime,
      state: match.state,
      bestOf: match.match.strategy.count,
      team1: {
        id: team1.id,
        name: team1.name,
        tag: team1.code,
        logo: team1.image,
      },
      team2: {
        id: team2.id,
        name: team2.name,
        tag: team2.code,
        logo: team2.image,
      },
      result,
      league: {
        id: match.league.id,
        name: match.league.name,
        slug: match.league.slug,
      },
      tournament: {
        name: event.tournament?.name || "Unknown Tournament",
        stage: event.blockName,
      },
    };
  }

  /**
   * Infer region from league slug
   */
  private getRegionFromLeague(slug: string): string {
    const regionMap: Record<string, string> = {
      lec: "Europe",
      lcs: "North America",
      lck: "Korea",
      lpl: "China",
      worlds: "International",
      msi: "International",
      first_stand: "International",
      pcs: "Pacific",
      vcs: "Vietnam",
      cblol: "Brazil",
      lla: "Latin America",
      ljl: "Japan",
      tco: "Turkey",
    };

    const lowerSlug = slug.toLowerCase();
    for (const [key, region] of Object.entries(regionMap)) {
      if (lowerSlug.includes(key)) {
        return region;
      }
    }

    return "Unknown";
  }

  /**
   * Get unique teams from scraped data
   */
  async scrapeTeams(): Promise<NormalizedTeam[]> {
    console.log("Scraping teams...");

    const response = await api.getMatches({
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Next 3 months
    });

    const teamsMap = new Map<string, NormalizedTeam>();

    response.data.schedule.events.forEach((event) => {
      if (event.type === "match" && event.match) {
        event.match.match.teams.forEach((team) => {
          if (!teamsMap.has(team.id)) {
            teamsMap.set(team.id, {
              id: team.id,
              name: team.name,
              tag: team.code,
              logo: team.image,
            });
          }
        });
      }
    });

    return Array.from(teamsMap.values());
  }

  /**
   * Get all leagues
   */
  async scrapeLeagues(): Promise<NormalizedLeague[]> {
    console.log("Scraping leagues...");

    const response = await api.getMatches();
    const leaguesMap = new Map<string, NormalizedLeague>();

    response.data.schedule.events.forEach((event) => {
      if (!leaguesMap.has(event.league.id)) {
        leaguesMap.set(event.league.id, {
          id: event.league.id,
          name: event.league.name,
          slug: event.league.slug,
          region: this.getRegionFromLeague(event.league.slug),
        });
      }
    });

    return Array.from(leaguesMap.values());
  }
}

// Export singleton instance
export const scraper = new ScraperService();
