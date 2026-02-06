import {
  ScraperOutput,
  Event as ApiEvent,
  NormalizedMatch,
  NormalizedTeam,
  NormalizedLeague,
  NormalizedTournament,
  HomeEvent,
  GetSeasonForNavigation,
} from "../types"
// Type definition for the raw data captured by the Fetcher
export type RawApiData = { [key: string]: any[] }

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
    const { matches, teams } = this.parseHomeEvents(rawData["homeEvents"])

    const { tournaments, leagues } = this.parseGetSeasonForNavigation(
      rawData["GetSeasonForNavigation"]
    )

    const filteredMatches = matches.filter((match) =>
      tournaments.find((t) => t.id === match.tournament.id)
    )

    const allDates = filteredMatches.map((match) =>
      new Date(match.date).getTime()
    )
    const minDate =
      allDates.length > 0 ? new Date(Math.min(...allDates)) : new Date()
    const maxDate =
      allDates.length > 0 ? new Date(Math.max(...allDates)) : new Date()

    return {
      leagues,
      teams,
      matches: filteredMatches,
      tournaments,
      metadata: {
        scrapedAt: new Date().toISOString(),
        dateRange: {
          start: minDate.toISOString(),
          end: maxDate.toISOString(),
        },
      },
    }
  }

  private parseHomeEvents(homeEvents: HomeEvent[]): {
    matches: NormalizedMatch[]
    teams: NormalizedTeam[]
  } {
    console.log(homeEvents.length)

    const matches: NormalizedMatch[] = []
    for (const homeEvent of homeEvents) {
      for (const event of homeEvent.data.esports.events) {
        if (
          event.matchTeams[0].code === "TBD" ||
          event.matchTeams[1].code === "TBD"
        )
          continue

        // Normalize team data with their results
        const teams = [
          {
            id: event.matchTeams[0].id.split(":")[1],
            name: event.matchTeams[0].name,
            tag: event.matchTeams[0].code,
            logo: event.matchTeams[0].image,
            result: event.matchTeams[0].result,
          },
          {
            id: event.matchTeams[1].id.split(":")[1],
            name: event.matchTeams[1].name,
            tag: event.matchTeams[1].code,
            logo: event.matchTeams[1].image,
            result: event.matchTeams[1].result,
          },
        ]

        // Sort teams by ID to ensure consistent ordering across scrapes
        // This prevents issues when the API changes team order based on pick side
        teams.sort((a, b) => a.id.localeCompare(b.id))

        const match: NormalizedMatch = {
          id: event.match.id,
          date: event.startTime,
          bestOf: event.match.strategy.count,
          state: event.match.state as NormalizedMatch["state"],
          team1: {
            id: teams[0].id,
            name: teams[0].name,
            tag: teams[0].tag,
            logo: teams[0].logo,
          },
          team2: {
            id: teams[1].id,
            name: teams[1].name,
            tag: teams[1].tag,
            logo: teams[1].logo,
          },
          result: {
            winner:
              teams[0].result.outcome === "win" ? teams[0].id : teams[1].id,
            team1Score: teams[0].result.gameWins,
            team2Score: teams[1].result.gameWins,
          },
          league: {
            id: event.league.id,
            name: event.league.name,
            slug: event.league.slug,
          },
          tournament: {
            id: event.tournament.id,
            name: event.tournament.name,
          },
          stage: event.blockName,
        }
        matches.push(match)
      }
    }
    return {
      matches,
      teams: Array.from(
        new Set(matches.flatMap((match) => [match.team1, match.team2]))
      ),
    }
  }

  private parseGetSeasonForNavigation(
    getSeasonForNavigations: GetSeasonForNavigation[]
  ): { tournaments: NormalizedTournament[]; leagues: NormalizedLeague[] } {
    const tournaments: NormalizedTournament[] = []
    for (const getSeasonForNavigation of getSeasonForNavigations) {
      for (const season of getSeasonForNavigation.data.seasons) {
        for (const split of season.splits) {
          for (const tour of split.tournaments) {
            const tournament: NormalizedTournament = {
              id: tour.id,
              name: tour.name,
              startTime: tour.startTime,
              endTime: tour.endTime,
              type: split.region,
              league: {
                id: tour.league.id,
                name: tour.league.name,
                image: tour.league.image,
                region: tour.league.region,
                regionSlug: tour.league.regionSlug,
              },
            }
            tournaments.push(tournament)
          }
        }
      }
    }
    return {
      tournaments,
      leagues: Array.from(new Set(tournaments.map((t) => t.league))),
    }
  }
}
