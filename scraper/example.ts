#!/usr/bin/env node

/**
 * Example: Using the scraper programmatically
 *
 * This demonstrates how to import and use the Playwright scraper
 * in your own Node.js applications.
 */

import { playwrightScraper } from "./src/playwright-scraper";
import * as fs from "fs";
import * as path from "path";

async function main() {
  try {
    // Initialize the browser
    await playwrightScraper.init(true); // true = headless mode

    console.log("🚀 Starting scraping tasks...\n");

    // Example 1: Get upcoming matches for the next 14 days
    console.log("📅 Fetching upcoming matches...");
    const upcomingMatches = await playwrightScraper.scrapeUpcoming(14);
    console.log(`   Found ${upcomingMatches.length} upcoming matches\n`);

    // Save to file
    fs.writeFileSync(
      path.join(__dirname, "data", "upcoming.json"),
      JSON.stringify(upcomingMatches, null, 2)
    );

    // Example 2: Get all leagues
    console.log("🏆 Fetching leagues...");
    const leagues = await playwrightScraper.scrapeLeagues();
    console.log(`   Found ${leagues.length} leagues\n`);
    leagues.forEach((league) => {
      console.log(`   - ${league.name} (${league.region})`);
    });

    // Example 3: Get all teams
    console.log("\n👥 Fetching teams...");
    const teams = await playwrightScraper.scrapeTeams();
    console.log(`   Found ${teams.length} teams\n`);

    // Example 4: Get completed matches from last 30 days
    console.log("✅ Fetching completed matches...");
    const completedMatches = await playwrightScraper.scrapeCompleted({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    });
    console.log(`   Found ${completedMatches.length} completed matches\n`);

    // Example 5: Get all data
    console.log("🔍 Fetching all data...");
    const allData = await playwrightScraper.scrapeAll({
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });
    console.log("   Summary:");
    console.log(`   - ${allData.leagues.length} leagues`);
    console.log(`   - ${allData.teams.length} teams`);
    console.log(`   - ${allData.matches.length} matches`);
    console.log(`   - ${allData.events.length} events\n`);

    // Save full data
    fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
    fs.writeFileSync(
      path.join(__dirname, "data", "full_data.json"),
      JSON.stringify(allData, null, 2)
    );

    console.log("✨ All done! Data saved to ./data/ directory");

    // Close the browser
    await playwrightScraper.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await playwrightScraper.close();
    process.exit(1);
  }
}

main();
