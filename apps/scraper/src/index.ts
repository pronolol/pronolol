#!/usr/bin/env node

import { FetcherService } from "./services/fetcher"
import { ParserService } from "./services/parser"
import { DatabaseService } from "./services/database"
import { config } from "./config/scraper"
import { runScrape } from "./run"
import { prisma } from "@pronolol/database"
const args = process.argv.slice(2)
const flags = {
  all: args.includes("--all"),
  leagues: args.includes("--leagues"),
  teams: args.includes("--teams"),
  matches: args.includes("--matches"),
  tournaments: args.includes("--tournaments"),
  help: args.includes("--help") || args.includes("-h"),
  pretty: args.includes("--pretty"),
  noSave: args.includes("--no-save"),
}

// Get leagues to scrape from CLI args, or use defaults from config
const leaguesArg = args.find((arg) => arg.startsWith("--leagues="))
const leaguesToScrape = leaguesArg
  ? leaguesArg.split("=")[1].split(",")
  : config.defaultLeagues

const printHelp = () => {
  console.log(`
LoL Esports Scraper CLI

Usage:
  npm run scrape [options]

Options:
  --all              Scrape and output all data (default behavior)
  --leagues          Output only leagues
  --teams            Output only teams
  --matches          Output only matches
  --tournaments      Output only tournaments

  --leagues=lck,lpl  Comma-separated list of league slugs to scrape
  --no-save          Prevent saving the scraped data to the database
  --pretty           Pretty print JSON output
  --help, -h         Show this help message

Examples:
  npm run scrape --all --leagues=lec,lcs
  npm run scrape --matches --no-save
  npm run scrape --tournaments --pretty

Database Environment Variables:
  PG_HOST, PG_USER, PG_DATABASE, PG_PASSWORD, PG_PORT
  `)
}

const main = async () => {
  const fetcher = new FetcherService()
  const parser = new ParserService()
  const dbService = new DatabaseService()

  try {
    if (flags.help) {
      printHelp()
      process.exit(0)
    }

    const processedData = await runScrape({
      fetcher,
      parser,
      dbService,
      leagues: leaguesToScrape,
      save: !flags.noSave,
    })

    let result: unknown
    if (flags.leagues) {
      console.error("🏆 Outputting leagues...")
      result = processedData.leagues
    } else if (flags.teams) {
      console.error("👥 Outputting teams...")
      result = processedData.teams
    } else if (flags.matches) {
      console.error("⚔️ Outputting matches...")
      result = processedData.matches
    } else if (flags.tournaments) {
      console.error("🏟️ Outputting tournaments...")
      result = processedData.tournaments
    } else {
      // Default: --all
      console.error("🔍 Outputting all data (use --help for options)...")
      result = processedData
    }

    // 5. Print result to stdout
    const output = flags.pretty
      ? JSON.stringify(result, null, 2)
      : JSON.stringify(result)

    console.log(output)

    console.error("✨ Done!")
  } catch (error) {
    console.error("❌ Scrape failed:", error)
    console.error(
      "   If this is a database error, ensure the database is running and DATABASE_URL is set correctly."
    )
    if (error instanceof Error) {
      console.error("Stack:", error.stack)
    }
    process.exit(1)
  } finally {
    await fetcher.close()
    await prisma.$disconnect()
  }
}

main()
