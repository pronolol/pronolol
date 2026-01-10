# LoL Esports Scraper - Complete Setup

✅ **Successfully created a TypeScript scraper package!**

## What's Been Built

### 📁 Structure

```
/scraper
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── types.ts          # TypeScript types for all data
│   ├── api.ts            # GraphQL API client
│   ├── scraper.ts        # Data fetching and normalization
│   └── index.ts          # CLI entry point
└── README.md             # Documentation
```

### 🎯 Data Types Defined

- **Teams**: Name, tag (e.g., "G2", "T1"), logo URL
- **Matches**: Teams, date, best-of format, result, league, tournament stage
- **Leagues**: Name, slug, region (LEC, Worlds, MSI, etc.)
- **Events**: Tournament information, dates, stages

### 🔧 API Client Features

- GraphQL API integration with persisted queries
- Methods for upcoming, completed, and filtered matches
- League-specific and international tournament queries
- Proper TypeScript typing throughout

## ⚠️ Current Status

The **direct HTTP API approach requires additional browser emulation** (cookies, specific headers, etc.).

## ✨ Recommended Next Steps

### Option 1: Use Playwright (Recommended)

Since you have Playwright MCP installed, we can:

1. Add Playwright to the scraper dependencies
2. Create a browser-based scraper that navigates the page
3. Intercept the GraphQL requests the browser makes
4. Extract clean data without needing to reverse-engineer authentication

### Option 2: Investigate API Requirements

- Capture all cookies/tokens from a real browser session
- Add them to the HTTP client
- May require periodic updates if tokens expire

## 🚀 How to Use (Once Fixed)

```bash
cd scraper
npm install

# Scrape all data
npm run scrape --all

# Scrape upcoming matches
npm run scrape --upcoming --days=7

# Scrape specific data
npm run scrape --leagues
npm run scrape --teams
npm run scrape --completed

# Output to file
npm run scrape --all > data.json
```

## 📅 Scheduling

Set up a cron job:

```bash
# Every hour
0 * * * * cd /path/to/scraper && npm run scrape > /path/to/data.json

# Daily at 3 AM
0 3 * * * cd /path/to/scraper && npm run scrape
```

Would you like me to implement the Playwright-based approach?
