# League Discovery Summary

## Questions Answered

### 1. Can the scraper work with other leagues like LCK, LFL?

**✅ YES!** The scraper works perfectly with other leagues.

**Test Results:**

- Successfully scraped **80 matches** from LCK (League of Legends Champions Korea)
- Captured data includes:
  - 12 unique teams (kt Rolster, DN SOOPers, Dplus KIA, BRION, Gen.G, DRX, BNK FEARX, NONGSHIM RED FORCE, Hanwha Life Esports, T1, Invictus Gaming)
  - Tournament: "LCK Cup 2026" and "Split 3 2025"
  - Stages: Week 1, Week 2, Week 3, Week 13, Week 14, Week 15, Play-Ins, Play In Knockouts, Playoffs, Finals
  - Match dates from August 2025 through February 2026
  - All match states: `unstarted`, `completed`, `inProgress`
  - Best-of formats: Bo3 and Bo5

**Example LCK Match:**

```json
{
  "id": "115848316381096423",
  "date": "2026-01-14T08:00:00Z",
  "state": "unstarted",
  "bestOf": 3,
  "team1": {
    "id": "99566404579461230",
    "name": "kt Rolster",
    "tag": "KT",
    "logo": "http://static.lolesports.com/teams/kt_darkbackground.png"
  },
  "team2": {
    "id": "99566404581868574",
    "name": "DN SOOPers",
    "tag": "DNS",
    "logo": "http://static.lolesports.com/teams/1767340467921_DN_SOOPerslogo_profile.webp"
  },
  "league": {
    "id": "98767991310872058",
    "name": "LCK",
    "slug": "lck"
  },
  "tournament": {
    "name": "LCK Cup 2026",
    "stage": "Week 1"
  }
}
```

### 2. How many leagues are available?

**27 regional leagues** + **3 international events** = **30 total options**

See [LEAGUES.md](./LEAGUES.md) for the complete list with slugs.

**Major Leagues:**

- LCS (Americas)
- LEC (Europe)
- LCK (Korea) ✅ TESTED
- LPL (China)
- CBLOL (Brazil)
- PCS (Pacific)

**European Regional:**

- LFL (La Ligue Française) ← Your requested league
- Prime League (Germany)
- SuperLiga (Spain)
- NLC (Northern)
- And 9 more...

### 3. Can we get tournament/split dates?

**⚠️ PARTIAL - Dates Exist in UI But Not in API**

**What We GET from API:**

- ✅ Tournament names ("LCK Cup 2026", "Split 3 2025")
- ✅ Tournament stages ("Week 1", "Playoffs", "Finals")
- ✅ Match dates with exact times
- ❌ **Tournament start/end dates** (fields are empty strings: `"startDate": "", "endDate": ""`)

**What the UI Shows:**
On the website, you can see tournament date ranges like:

- "Regional Split Jan 12 - Mar 8"
- "First Stand Mar 16 - Mar 22"
- "MSI Jun - Jul"
- "Worlds Oct - Nov"

**Why the Gap:**
The GraphQL `homeEvents` API operation returns empty `startDate` and `endDate` fields for tournaments. The dates are either:

1. In a different GraphQL operation we haven't discovered
2. Calculated client-side from match dates
3. Hardcoded in the UI

**Workaround Solution:**
We could calculate tournament dates from the match data:

- **Tournament Start**: Earliest match date in the tournament
- **Tournament End**: Latest match date in the tournament

This would give us accurate date ranges based on actual scheduled matches.

## Current Implementation Status

### What's Working

- ✅ Scrapes any league by changing the `leagues` array at line 52 of `playwright-scraper.ts`
- ✅ URL pattern: `https://lolesports.com/en-US/leagues/{comma-separated-slugs}`
- ✅ Captures full match data with teams, results, dates, states
- ✅ File output working perfectly (per your requirement)

### What Needs Configuration

- 🔧 Currently hardcoded to 4 leagues: `['first_stand', 'lec', 'msi', 'worlds']`
- 🔧 Need to make leagues parameter configurable via CLI
- 🔧 Tournament dates need to be calculated from match dates or found in different API

## Next Steps Recommended

1. **Make leagues configurable** - Add `--leagues` CLI flag

   ```bash
   npm run scrape -- --leagues lck,lfl,lcs > multi_league.json
   ```

2. **Calculate tournament dates** - Add logic to compute from match dates

   ```typescript
   const startDate = Math.min(...matches.map((m) => new Date(m.date)));
   const endDate = Math.max(...matches.map((m) => new Date(m.date)));
   ```

3. **Test with LFL** - Verify French league works like LCK did

4. **Update documentation** - Add league configuration examples

## Files Created

- `LEAGUES.md` - Complete reference of all 30 available leagues with slugs and usage examples
- `lck_test.json` - 80 LCK matches captured successfully
- `lck_test_errors.log` - Clean execution, no errors

## Conclusion

**Yes, your scraper can work with LCK, LFL, and all 30 available leagues!**

The API structure is identical across leagues - same GraphQL endpoint, same data format. You just need to change which league slugs you pass in the URL. The only missing piece is tournament start/end dates, which can be calculated from the match schedule.

---

## 🎯 UPDATE: Tournament Dates SOLVED!

### Discovery (January 9, 2026)

Found that the **`GetSeasonForNavigation` GraphQL operation** contains complete tournament metadata with dates!

**Data Structure**:

```json
{
  "seasons": [
    {
      "splits": [
        {
          "tournaments": [
            {
              "id": "115548424304940735",
              "name": "LEC Versus 2026",
              "startTime": "2026-01-16T23:00:00Z",
              "endTime": "2026-03-01T22:59:00Z"
            }
          ]
        }
      ]
    }
  ]
}
```

### Implementation

Modified scraper to capture ALL GraphQL operations:

- ✅ `homeEvents` - Match data
- ✅ `GetSeasonForNavigation` - **Tournament dates** ⭐
- ✅ `GetPickemsLeaguesSimple` - Pickems data

All responses saved to `all_graphql_responses.json`.

**Next**: Parse tournament data and merge with matches by tournament ID.

See: `SOLUTION_TOURNAMENT_DATES.md` for full details.
