# 🎯 SOLUTION FOUND: Tournament Dates

## Discovery

The **`GetSeasonForNavigation`** GraphQL operation contains tournament metadata including start and end dates!

## Data Structure

```json
{
  "seasons": [
    {
      "splits": [
        {
          "startTime": "2026-01-11T23:00:00Z",
          "endTime": "2026-03-07T23:00:00Z",
          "name": "Split 1",
          "tournaments": [
            {
              "id": "115548424304940735",
              "name": "LEC Versus 2026",
              "startTime": "2026-01-16T23:00:00Z",
              "endTime": "2026-03-01T22:59:00Z",
              "league": {
                "id": "98767991302996019",
                "name": "LEC"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## Key Findings

✅ **Tournament dates ARE available** via `GetSeasonForNavigation` operation
✅ **Fields**: `startTime` and `endTime` (not `startDate`/`endDate`)
✅ **Structure**: `seasons[].splits[].tournaments[]`
✅ **Captured automatically** by our Playwright scraper

## Implementation Plan

1. **Update scraper** to parse `GetSeasonForNavigation` responses
2. **Build tournament lookup** by tournament ID
3. **Merge with match data** to add tournament dates to events
4. **Export both**:
   - Match data (existing)
   - Tournament metadata (new)

## Example Usage

```typescript
// From GetSeasonForNavigation
const tournaments = {
  "115548424304940735": {
    name: "LEC Versus 2026",
    startTime: "2026-01-16T23:00:00Z",
    endTime: "2026-03-01T22:59:00Z",
  },
};

// From homeEvents (existing match data)
const match = {
  id: "115548424308414192",
  tournament: {
    id: "115548424304940735", // Use this to lookup dates
    name: "LEC Versus 2026",
  },
};

// Merge them
const enrichedMatch = {
  ...match,
  tournament: {
    ...match.tournament,
    startTime: tournaments[match.tournament.id].startTime,
    endTime: tournaments[match.tournament.id].endTime,
  },
};
```

## Operations Captured

Our modified scraper now captures:

1. **homeEvents** - Match data (40 events)
2. **GetSeasonForNavigation** - Tournament/season metadata with dates ✨
3. **GetPickemsLeaguesSimple** - Pickems data

All saved to: `all_graphql_responses.json`
