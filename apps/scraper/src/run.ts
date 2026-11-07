import type { FetcherService } from "./services/fetcher"
import type { ParserService } from "./services/parser"
import type { DatabaseService } from "./services/database"
import { sendHeartbeat } from "./services/heartbeat"
import type { ScraperOutput } from "./types"

export type RunScrapeDeps = {
  fetcher: Pick<FetcherService, "fetchData">
  parser: Pick<ParserService, "parse">
  dbService: Pick<DatabaseService, "saveScrapedData">
  leagues: string[]
  save: boolean
}

/**
 * Fetch, parse and persist one scrape run, then report the outcome to
 * Uptime Kuma. "up" is only sent once the data is saved; any failure
 * (including the database) sends "down" and is rethrown.
 */
export const runScrape = async ({
  fetcher,
  parser,
  dbService,
  leagues,
  save,
}: RunScrapeDeps): Promise<ScraperOutput> => {
  try {
    const rawData = await fetcher.fetchData(leagues)
    const processedData = parser.parse(rawData)
    console.error("✅ Data parsing complete.")
    console.error(
      `📊 Summary: scraped from ${processedData.metadata.dateRange.start} to ${processedData.metadata.dateRange.end}`
    )

    if (save) {
      await dbService.saveScrapedData(processedData)
    } else {
      console.error("📋 --no-save flag present, skipping database persistence.")
    }

    await sendHeartbeat(
      "up",
      `OK: ${processedData.matches.length} matches (${leagues.join(",")})`
    )
    return processedData
  } catch (error) {
    await sendHeartbeat(
      "down",
      error instanceof Error ? error.message : String(error)
    )
    throw error
  }
}
