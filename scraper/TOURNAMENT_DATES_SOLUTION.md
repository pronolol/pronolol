# Tournament Date Investigation - Summary

## Problem

The `homeEvents` GraphQL operation returns empty `startDate` and `endDate` fields for tournaments, even though the UI displays date ranges like "Regional Split Jan 12 - Mar 8".

## Discovered GraphQL Operations

From network traffic analysis:

1. **homeEvents** - Match/event data (currently used, dates empty)
2. **homeLeagues** - League information with tournaments
3. **GetGprSeasons** - Global Power Rankings seasons
4. **GetSeasonForNavigation** - Season navigation data
5. **GetPickemsLeaguesSimple** - Pickems leagues

## API Authentication Issue

Direct API requests fail with:

- 400 Bad Request: CSRF protection requires `Content-Type` header
- 401 Unauthorized: "No client headers set" error

The lolesports.com API requires browser-based authentication that can't be easily replicated in standalone requests.

## Solution: Continue Using Playwright

Since direct API calls are blocked, the best approach is:

1. **Keep current Playwright scraper** - It successfully captures data by intercepting browser requests
2. **Navigate to league-specific pages** - Each league page may trigger different API calls
3. **Intercept multiple operations** - Modify response handler to capture `homeLeagues` and other operations, not just `homeEvents`
4. **Extract tournament metadata** - The `homeLeagues` operation likely contains tournament date information

## Next Steps

### Update Playwright Scraper

Modify the response handler in `playwright-scraper.ts` to:

- Capture responses from multiple operations (homeEvents, homeLeagues, etc.)
- Store league/tournament metadata separately from match data
- Extract tournament dates from league data structure

### Test with Different URL

Try navigating to different pages that might trigger additional API calls:

- Individual league pages: `/en-US/leagues/lck`
- Tournament pages (if they exist)
- Schedule overview pages

The browser naturally handles all authentication, so we avoid the API authorization issues.
