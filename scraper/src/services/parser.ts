import {
  ScraperOutput,
  Event as ApiEvent,
  NormalizedMatch,
  NormalizedTeam,
  NormalizedLeague,
  NormalizedTournament,
} from "../types";
import { config } from "../config/scraper";

// Type definition for the raw data captured by the Fetcher
export type RawApiData = { [key: string]: any[] };

/**
 * The Parser service is responsible for transforming the raw API data
 * captured by the Fetcher into a clean, normalized, and enriched format.
 */
export class ParserService {

  /**
   * Processes the raw API data to extract, normalize, and merge all relevant information.
   * @param rawData - The raw data object from the FetcherService.
   */
  public parse(rawData: RawApiData): ScraperOutput {
    const tournaments = this.parseTournaments(rawData["GetSeasonForNavigation"]);
    const { matches, teams, leagues } = this.parseEvents(rawData["homeEvents"], tournaments);

    const allDates = matches.map(match => new Date(match.date).getTime());
    const minDate = allDates.length > 0 ? new Date(Math.min(...allDates)) : new Date();
    const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates)) : new Date();

    return {
      leagues,
      teams,
      matches,
      tournaments: Object.values(tournaments),
      metadata: {
        scrapedAt: new Date().toISOString(),
        dateRange: {
          start: minDate.toISOString(),
          end: maxDate.toISOString(),
        },
      },
    };
  }

  /**
   * Parses tournament data from the 'GetSeasonForNavigation' GraphQL responses.
   * @param responses - An array of 'GetSeasonForNavigation' API responses.
   * @returns A map of tournament IDs to NormalizedTournament objects.
   */
  private parseTournaments(responses: any[] | undefined): Record<string, NormalizedTournament> {
    if (!responses) return {};

    const tournaments: Record<string, NormalizedTournament> = {};

    for (const res of responses) {
      const seasons = res?.data?.seasons || [];
      for (const season of seasons) {
        for (const split of season.splits) {
          for (const tour of split.tournaments) {
            if (!tournaments[tour.id]) {
              tournaments[tour.id] = {
                id: tour.id,
                name: tour.name,
                startTime: tour.startTime,
                endTime: tour.endTime,
                league: { // This is partial, will be enriched in the main parser
                  id: tour.league.id,
                  name: tour.league.name,
                  slug: tour.league.slug,
                  region: 'Unknown',
                },
                type: split.name,
              };
            }
          }
        }
      }
    }
    return tournaments;
  }

  /**
   * Parses match events from the 'homeEvents' GraphQL responses.
   * @param responses - An array of 'homeEvents' API responses.
   * @param tournaments - A lookup map of already parsed tournaments.
   * @returns An object containing the normalized matches, teams, and leagues.
   */
  private parseEvents(responses: any[] | undefined, tournaments: Record<string, NormalizedTournament>) {
    if (!responses) {
      return { matches: [], teams: [], leagues: [] };
    }

    const teamsMap = new Map<string, NormalizedTeam>();
    const leaguesMap = new Map<string, NormalizedLeague>();
    const matches: NormalizedMatch[] = [];

    const allApiEvents: ApiEvent[] = responses
      .flatMap(res => res?.data?.esports?.events || [])
      .filter(event => event.type === 'match' && event.match && event.matchTeams);

    for (const event of allApiEvents) {
      // Extract and enrich league
      if (!leaguesMap.has(event.league.id)) {
        const region = this.getRegionFromLeague(event.league.slug);
        leaguesMap.set(event.league.id, {
          id: event.league.id,
          name: event.league.name,
          slug: event.league.slug,
          region,
        });
      }

      // Update league info in the tournaments map
      if (tournaments[event.tournament.id]) {
        tournaments[event.tournament.id].league = leaguesMap.get(event.league.id)!;
      }

      // Extract teams
      event.matchTeams.forEach((team) => {
        const teamId = team.id.split(":")[1] || team.id;
        if (!teamsMap.has(teamId)) {
          teamsMap.set(teamId, {
            id: teamId,
            name: team.name,
            tag: team.code,
            logo: team.image,
          });
        }
      });

      // Normalize match
      matches.push(this.normalizeMatch(event, tournaments[event.tournament.id]));
    }

    return {
      matches,
      teams: Array.from(teamsMap.values()),
      leagues: Array.from(leaguesMap.values()),
    };
  }

  /**
   * Normalizes a single match event into a simplified and enriched format.
   */
  private normalizeMatch(event: ApiEvent, tournament: NormalizedTournament | undefined): NormalizedMatch {
    const match = event.match!;
    const [team1, team2] = event.matchTeams;

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
      league: {
        id: event.league.id,
        name: event.league.name,
        slug: event.league.slug,
      },
      tournament: {
        id: event.tournament.id,
        name: tournament?.name || event.tournament.name,
        stage: event.blockName,
        startDate: tournament?.startTime,
        endDate: tournament?.endTime,
      },
    };
  }

  /**
   * Infers a league's region from its slug using the config map.
   */
  private getRegionFromLeague(slug: string): string {
    const lowerSlug = slug.toLowerCase();
    for (const [key, region] of Object.entries(config.regionMap)) {
      if (lowerSlug.includes(key)) {
        return region;
      }
    }
    return "Unknown";
  }
}
