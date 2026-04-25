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

### Scheduling

The scraper supports two scheduling modes:

#### Mode 1: Self-Scheduled (Recommended)

The scraper can run on its own schedule without relying on external cron. This is the recommended approach for containerized deployments.

**Environment Variables:**

- `SCRAPER_MODE=schedule` - Enable scheduled mode
- `SCRAPER_SCHEDULE="0 * * * *"` - Cron expression for scheduling

**Examples:**

```bash
# Run every hour at minute 0
SCRAPER_MODE=schedule SCRAPER_SCHEDULE="0 * * * *" npm run scrape

# Run every 30 minutes
SCRAPER_MODE=schedule SCRAPER_SCHEDULE="*/30 * * * *" npm run scrape

# Run every day at 3 AM
SCRAPER_MODE=schedule SCRAPER_SCHEDULE="0 3 * * *" npm run scrape
```

**Docker Compose:**

```yaml
services:
  scraper:
    environment:
      SCRAPER_MODE: schedule
      SCRAPER_SCHEDULE: "0 * * * *"
```

The scraper will:

1. Run an initial scrape immediately on startup
2. Continue running and execute subsequent scrapes according to the schedule
3. Keep the process alive for the next scheduled run

#### Mode 2: External Cron

You can still use external cron to call the scraper periodically. This runs the scraper once per invocation.

```bash
# Run every hour to keep the database updated
0 * * * * cd /path/to/pronolol_backend/scraper && npm run scrape

# Run once a day at 3 AM
0 3 * * * cd /path/to/pronolol_backend/scraper && npm run scrape
```

#### Cron Syntax Reference

```
* * * * * *
┬ ┬ ┬ ┬ ┬ ┬
│ │ │ │ │ └─ day of week (0 - 7) (0 or 7 is Sunday)
│ │ │ │ └─── month (1 - 12)
│ │ │ └───── day of month (1 - 31)
│ │ └─────── hour (0 - 23)
│ └───────── minute (0 - 59)
└─────────── second (0 - 59, optional)
```

Common examples:

- `"* * * * *"` - Every minute
- `"0 * * * *"` - Every hour at minute 0
- `"*/30 * * * *"` - Every 30 minutes
- `"0 3 * * *"` - Every day at 3:00 AM
- `"0 */6 * * *"` - Every 6 hours

## Output

Data is persisted to the database by default. If you use the `--no-save` flag, the scraped data will be printed to `stdout` in JSON format.
