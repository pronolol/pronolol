# LoL Esports Scraper - Working! ✅

## Status: Fully Functional

The Playwright-based scraper is successfully scraping League of Legends esports data from lolesports.com!

## Test Results

### ✅ Test 1: Upcoming Matches (7 days)

```bash
npm run scrape -- --upcoming --days=7
```

**Result:** Successfully captured 40 upcoming LEC matches including:

- Match IDs, dates, and times
- Team information (names, tags, logos)
- League information
- Tournament and stage details
- Match state (unstarted)
- Best-of format

Sample output:

```json
{
  "id": "115548424308414192",
  "date": "2026-01-17T16:00:00Z",
  "state": "unstarted",
  "bestOf": 1,
  "team1": {
    "id": "113770064260414203",
    "name": "Los Ratones",
    "tag": "LR",
    "logo": "http://static.lolesports.com/teams/1736206905390_LR1.png"
  },
  "team2": {
    "id": "98767991866488695",
    "name": "Fnatic",
    "tag": "FNC",
    "logo": "http://static.lolesports.com/teams/1631819669150_fnc-2021-worlds.png"
  },
  "league": {
    "id": "98767991302996019",
    "name": "LEC",
    "slug": "lec"
  },
  "tournament": {
    "name": "LEC Versus 2026",
    "stage": "Week 1"
  }
}
```

## How It Works

1. **Browser Launch:** Uses Playwright to launch a real Chromium browser
2. **Page Navigation:** Navigates to lolesports.com with selected leagues
3. **API Interception:** Listens for GraphQL API responses from `/api/gql`
4. **Data Capture:** Captures events from the `homeEvents` query
5. **Data Processing:** Normalizes raw API data into clean structured format
6. **Output:** Returns JSON with leagues, teams, matches, and events

## Available Commands

```bash
# Get upcoming matches
npm run scrape -- --upcoming --days=7

# Get completed matches
npm run scrape -- --completed --start=2026-01-01 --end=2026-01-31

# Get all data (leagues, teams, matches, events)
npm run scrape:all

# Get only leagues
npm run scrape:leagues

# Get only teams
npm run scrape:teams

# Get only matches
npm run scrape:matches

# Pretty print JSON
npm run scrape -- --upcoming --days=7 --pretty
```

## Scheduling

To run this scraper on a schedule, you can use cron:

```bash
# Run every day at midnight
0 0 * * * cd /path/to/scraper && npm run scrape:all > /path/to/data/matches.json

# Run every 6 hours
0 */6 * * * cd /path/to/scraper && npm run scrape -- --upcoming --days=30 > /path/to/data/upcoming.json
```

## Architecture

- **Language:** TypeScript 5.3.3
- **Runtime:** Node.js 20+
- **Browser:** Playwright with Chromium
- **Output:** Clean, structured JSON to stdout
- **Logging:** Progress messages to stderr

## Next Steps

✅ Scraper is working and ready to use!

Optional enhancements:

- Add database persistence (PostgreSQL integration)
- Add error recovery and retry logic
- Add rate limiting for frequent scraping
- Add more leagues beyond LEC/MSI/Worlds/First Stand
- Add webhook notifications for new matches
- Create a REST API wrapper around the scraper
