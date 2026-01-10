import { chromium, Browser, Page, Route } from "playwright";
import {
  HomeEventsResponse,
  NormalizedMatch,
  NormalizedTeam,
  NormalizedLeague,
  NormalizedEvent,
  ScraperOutput,
  Event,
} from "./types";

/**
 * Playwright-based scraper that intercepts API calls from the browser
 * This approach works reliably as it uses the actual browser context
 */
export class PlaywrightScraperService {
  private browser: Browser | null = null;

  /**
   * Initialize the browser
   */
  async init(headless: boolean = true): Promise<void> {
    console.log("🌐 Launching browser...");
    this.browser = await chromium.launch({ headless });
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrape all data by navigating the page and intercepting API calls
   */
  async scrapeAll(
    options: {
      startDate?: Date;
      endDate?: Date;
      leagues?: string[];
    } = {}
  ): Promise<ScraperOutput> {
    if (!this.browser) {
      await this.init();
    }

    const {
      startDate = new Date(),
      endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      leagues = ["first_stand", "lec", "msi", "worlds"],
    } = options;

    console.log(
      `📊 Scraping data from ${startDate.toISOString()} to ${endDate.toISOString()}...`
    );

    const page = await this.browser!.newPage();
    const apiResponses: Event[] = [];
    const allApiData: { [key: string]: any[] } = {}; // Store all GraphQL responses

    // Intercept ALL GraphQL API responses
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/api/gql")) {
        const contentType = response.headers()["content-type"];

        if (contentType && contentType.includes("application/json")) {
          try {
            const json = await response.json();

            // Extract operation name from URL
            const operationMatch = url.match(/operationName=([^&]+)/);
            const operationName = operationMatch
              ? operationMatch[1]
              : "unknown";

            console.log(`📡 Captured API response from: ${operationName}`);

            // Store all responses by operation name
            if (!allApiData[operationName]) {
              allApiData[operationName] = [];
            }
            allApiData[operationName].push(json);

            // Continue processing homeEvents for matches
            if (operationName === "homeEvents" && json.data?.esports?.events) {
              const events = json.data.esports.events;
              console.log(`  ✓ Found ${events.length} events`);
              apiResponses.push(...events);
            }
          } catch (e) {
            console.log(`  ✗ Failed to parse JSON: ${e}`);
          }
        }
      }
    });

    // Navigate to the page with the selected leagues
    const leaguesParam = leagues.join(",");
    const url = `https://lolesports.com/en-US/leagues/${leaguesParam}`;
    console.log(`🔗 Navigating to ${url}...`);

    await page.goto(url, { waitUntil: "networkidle" });

    // Wait a bit more for all API calls to complete
    await page.waitForTimeout(3000);

    // Click "Load More" button if it exists to get more matches
    try {
      const loadMoreButton = page.locator(
        'button:has-text("Load more"), button:has-text("Charger plus")'
      );
      const isVisible = await loadMoreButton.isVisible({ timeout: 2000 });

      if (isVisible) {
        console.log("📥 Loading more matches...");
        await loadMoreButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      // No load more button or already loaded
    }

    await page.close();

    // Save all captured GraphQL data for analysis
    const fs = require("fs");
    const allDataPath = "all_graphql_responses.json";
    fs.writeFileSync(allDataPath, JSON.stringify(allApiData, null, 2));
    console.log(`📝 Saved all GraphQL responses to: ${allDataPath}`);
    console.log(
      `   Operations captured: ${Object.keys(allApiData).join(", ")}`
    );

    // Process all captured API responses
    console.log(
      `✅ Captured ${apiResponses.length} total events from API calls`
    );

    // Extract and normalize data
    return this.processEvents(apiResponses, startDate, endDate);
  }

  /**
   * Process events into normalized output format
   */
  private processEvents(
    events: Event[],
    startDate: Date,
    endDate: Date
  ): ScraperOutput {
    const teamsMap = new Map<string, NormalizedTeam>();
    const leaguesMap = new Map<string, NormalizedLeague>();
    const matches: NormalizedMatch[] = [];
    const tournamentEvents: NormalizedEvent[] = [];

    for (const event of events) {
      // Skip non-match events
      if (event.type !== "match" || !event.match || !event.matchTeams) {
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
      event.matchTeams.forEach((team) => {
        if (!teamsMap.has(team.id.split(":")[1] || team.id)) {
          // Use actual team ID, not match-specific one
          teamsMap.set(team.id.split(":")[1] || team.id, {
            id: team.id.split(":")[1] || team.id,
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
          startDate: "", // Not provided in this API response
          endDate: "", // Not provided in this API response
          league: leaguesMap.get(event.league.id)!,
          type: event.blockName || "",
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
   * Normalize a match event into a simplified format
   */
  private normalizeMatch(event: Event): NormalizedMatch {
    const match = event.match;
    const teams = event.matchTeams;
    const [team1, team2] = teams;

    // Determine winner and score if match is completed
    let result;
    if (match.state === "completed") {
      const team1Wins = team1.result?.gameWins || 0;
      const team2Wins = team2.result?.gameWins || 0;

      result = {
        winner:
          team1Wins > team2Wins
            ? team1.id.split(":")[1] || team1.id
            : team2.id.split(":")[1] || team2.id,
        score: `${team1Wins}-${team2Wins}`,
      };
    }

    return {
      id: match.id,
      date: event.startTime,
      state: match.state,
      bestOf: match.strategy.count,
      team1: {
        id: team1.id.split(":")[1] || team1.id,
        name: team1.name,
        tag: team1.code,
        logo: team1.image,
      },
      team2: {
        id: team2.id.split(":")[1] || team2.id,
        name: team2.name,
        tag: team2.code,
        logo: team2.image,
      },
      result,
      league: {
        id: event.league.id,
        name: event.league.name,
        slug: event.league.slug,
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
   * Scrape only upcoming matches
   */
  async scrapeUpcoming(
    daysAhead: number = 30,
    leagues?: string[]
  ): Promise<NormalizedMatch[]> {
    console.log(
      `📅 Scraping upcoming matches for the next ${daysAhead} days...`
    );

    const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    const data = await this.scrapeAll({
      startDate: new Date(),
      endDate,
      leagues,
    });

    return data.matches.filter((match) => match.state === "unstarted");
  }

  /**
   * Scrape completed matches
   */
  async scrapeCompleted(
    options: {
      startDate?: Date;
      endDate?: Date;
      leagues?: string[];
    } = {}
  ): Promise<NormalizedMatch[]> {
    console.log("✅ Scraping completed matches...");

    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date(),
      leagues,
    } = options;

    const data = await this.scrapeAll({
      startDate,
      endDate,
      leagues,
    });

    return data.matches.filter((match) => match.state === "completed");
  }

  /**
   * Get unique teams
   */
  async scrapeTeams(leagues?: string[]): Promise<NormalizedTeam[]> {
    console.log("👥 Scraping teams...");

    const data = await this.scrapeAll({
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      leagues,
    });

    return data.teams;
  }

  /**
   * Get all leagues
   */
  async scrapeLeagues(): Promise<NormalizedLeague[]> {
    console.log("🏆 Scraping leagues...");

    const data = await this.scrapeAll();
    return data.leagues;
  }
}

// Export singleton instance
export const playwrightScraper = new PlaywrightScraperService();
