# LoL Esports Scraper ✅

**Status:** Fully functional and tested!

A TypeScript-based scraper for League of Legends esports data from lolesports.com using Playwright browser automation.

## Features

- ✅ Fetches data from the official lolesports.com GraphQL API via browser automation
- ✅ No authentication required - uses Playwright to handle browser context
- ✅ Type-safe TypeScript implementation
- ✅ CLI interface for easy execution
- ✅ Tested and working with real LEC/MSI/Worlds data

## Data Collected

- **Leagues**: Name, slug, region
- **Teams**: Name, tag, logo URL
- **Matches**: Teams, date, best-of format, result, league/tournament
- **Events**: Tournament name, dates, type (regular season, playoffs, etc.)

## Installation

```bash
npm install
```

## Usage

### Development Mode (with ts-node)

```bash
# Scrape everything
npm run scrape

# Scrape specific data
npm run scrape:leagues
npm run scrape:matches
npm run scrape:all
```

### Production Mode

```bash
# Build first
npm run build

# Run
npm start
```

### Scheduling

You can schedule this scraper using cron:

```bash
# Run every hour
0 * * * * cd /path/to/scraper && npm run scrape

# Run every day at 3 AM
0 3 * * * cd /path/to/scraper && npm run scrape
```

## Output

Data is output to `stdout` in JSON format. You can redirect it to a file or pipe it to your API:

```bash
npm run scrape > data.json
```

## API Endpoints Used

- GraphQL API: `https://lolesports.com/api/gql`
- Uses persisted queries (no authentication needed)
