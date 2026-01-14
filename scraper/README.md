# LoL Esports Scraper ✅

A TypeScript-based scraper for League of Legends esports data from lolesports.com using Playwright and PostgreSQL.

## Features

- ✅ Fetches match and tournament data from the official lolesports.com GraphQL API.
- ✅ Uses Playwright to reliably bypass API authentication.
- ✅ Persists all scraped data into a PostgreSQL database.
- ✅ Type-safe, modular, and refactored codebase.
- ✅ CLI interface for easy execution and configuration.

## Installation

```bash
# From the scraper/ directory
npm install
```

## Database Setup

1.  **Create Database:** Set up a PostgreSQL database on your provider of choice.
2.  **Initialize Schema:** Use the `database/schema.sql` file (located in the project root) to create the necessary tables (`leagues`, `teams`, `tournaments`, `matches`).
3.  **Set Environment Variables:** The scraper connects to the database using environment variables. You can set these in your shell or use a `.env` file.

    ```bash
    export PG_HOST=your_database_host
    export PG_USER=your_database_user
    export PG_DATABASE=your_database_name
    export PG_PASSWORD=your_database_password
    export PG_PORT=5432
    ```

## Usage

By default, running the scraper will fetch the data and save it to the configured PostgreSQL database.

```bash
# Scrape default leagues and save to DB
npm run scrape

# Scrape specific leagues and save to DB
npm run scrape -- --leagues=lck,lpl,lec

# Scrape without saving to the database (outputs to stdout)
npm run scrape -- --no-save

# Scrape and pretty-print the JSON output without saving
npm run scrape -- --no-save --pretty > output.json
```

### Scheduling with Cron

You can schedule this scraper to run periodically using cron.

```bash
# Run every hour to keep the database updated
0 * * * * cd /path/to/pronolol_backend/scraper && npm run scrape

# Run once a day at 3 AM
0 3 * * * cd /path/to/pronolol_backend/scraper && npm run scrape
```

## Output

Data is persisted to the database by default. If you use the `--no-save` flag, the scraped data will be printed to `stdout` in JSON format.
