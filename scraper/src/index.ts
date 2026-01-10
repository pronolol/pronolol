#!/usr/bin/env node

import { playwrightScraper } from "./playwright-scraper";

/**
 * CLI entry point for the LoL Esports scraper
 */

const args = process.argv.slice(2);
const flags = {
  all: args.includes("--all"),
  leagues: args.includes("--leagues"),
  teams: args.includes("--teams"),
  matches: args.includes("--matches"),
  upcoming: args.includes("--upcoming"),
  completed: args.includes("--completed"),
  help: args.includes("--help") || args.includes("-h"),
  json: args.includes("--json") || true, // Always output JSON
  pretty: args.includes("--pretty"),
};

// Get date range options
const daysArg = args.find((arg) => arg.startsWith("--days="));
const days = daysArg ? parseInt(daysArg.split("=")[1], 10) : 30;

const startDateArg = args.find((arg) => arg.startsWith("--start="));
const endDateArg = args.find((arg) => arg.startsWith("--end="));

const startDate = startDateArg
  ? new Date(startDateArg.split("=")[1])
  : undefined;
const endDate = endDateArg ? new Date(endDateArg.split("=")[1]) : undefined;

function printHelp() {
  console.log(`
LoL Esports Scraper CLI

Usage:
  npm run scrape [options]

Options:
  --all              Scrape all data (teams, matches, leagues, events)
  --leagues          Scrape only leagues
  --teams            Scrape only teams
  --matches          Scrape only matches
  --upcoming         Scrape only upcoming matches
  --completed        Scrape only completed matches

  --days=N           Number of days ahead for upcoming matches (default: 30)
  --start=DATE       Start date (ISO format: YYYY-MM-DD)
  --end=DATE         End date (ISO format: YYYY-MM-DD)

  --pretty           Pretty print JSON output
  --help, -h         Show this help message

Examples:
  npm run scrape --all
  npm run scrape --upcoming --days=7
  npm run scrape --completed --start=2026-01-01 --end=2026-01-31
  npm run scrape --leagues
  npm run scrape --matches --pretty

Output:
  Data is written to stdout in JSON format. Redirect to a file:
  npm run scrape --all > data.json
  `);
}

async function main() {
  try {
    if (flags.help) {
      printHelp();
      process.exit(0);
    }

    // Initialize Playwright scraper
    await playwrightScraper.init(true); // headless mode

    let result: any;

    // Determine what to scrape
    if (flags.all) {
      console.error("🔍 Scraping all data...");
      result = await playwrightScraper.scrapeAll({ startDate, endDate });
    } else if (flags.leagues) {
      console.error("🏆 Scraping leagues...");
      result = await playwrightScraper.scrapeLeagues();
    } else if (flags.teams) {
      console.error("👥 Scraping teams...");
      result = await playwrightScraper.scrapeTeams();
    } else if (flags.upcoming) {
      console.error(`📅 Scraping upcoming matches (${days} days)...`);
      result = await playwrightScraper.scrapeUpcoming(days);
    } else if (flags.completed) {
      console.error("✅ Scraping completed matches...");
      result = await playwrightScraper.scrapeCompleted({ startDate, endDate });
    } else if (flags.matches) {
      console.error("⚔️  Scraping all matches...");
      const data = await playwrightScraper.scrapeAll({ startDate, endDate });
      result = data.matches;
    } else {
      // Default: scrape all
      console.error("🔍 Scraping all data (use --help for options)...");
      result = await playwrightScraper.scrapeAll({ startDate, endDate });
    }

    // Close the browser
    await playwrightScraper.close();

    // Output result
    const output = flags.pretty
      ? JSON.stringify(result, null, 2)
      : JSON.stringify(result);

    console.log(output);

    console.error("✨ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }

    // Make sure to close browser on error
    await playwrightScraper.close();
    process.exit(1);
  }
}

main();
