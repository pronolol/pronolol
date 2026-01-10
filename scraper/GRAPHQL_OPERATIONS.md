# GraphQL Operations Discovery

## API Endpoint

`https://lolesports.com/api/gql`

## Discovered Operations

Based on network traffic analysis when loading the LCK leagues page:

### 1. homeEvents (Currently Used)

**Purpose**: Fetch match/event data
**Operation Name**: `homeEvents`
**Persisted Query Hash**: `7246add6f577cf30b304e651bf9e25fc6a41fe49aeafb0754c16b5778060fc0a`

**Variables**:

```json
{
  "hl": "en-US",
  "sport": "lol",
  "leagues": [
    "113464388705111224",
    "98767975604431411",
    "98767991310872058",
    "98767991325878492"
  ],
  "eventDateStart": "2026-01-07T23:00:00.000Z",
  "eventDateEnd": "2026-03-08T23:00:00.000Z",
  "eventState": ["unstarted"],
  "eventType": "match",
  "pageSize": 40
}
```

**Known Issue**: Returns empty `startDate` and `endDate` for tournaments

---

### 2. homeLeagues

**Purpose**: Fetch league information with tournaments
**Operation Name**: `homeLeagues`
**Persisted Query Hash**: `47a15b362554c95b9b0cc3789e59661bc87ed6e5c6d5738712a409e384457c5e`

**Variables**:

```json
{
  "hl": "en-US",
  "sport": ["lol"],
  "flags": ["excludeHidden", "excludeWithoutTournaments"]
}
```

**Potential**: May contain tournament metadata with dates

---

### 3. GetGprSeasons

**Purpose**: Fetch Global Power Rankings seasons
**Operation Name**: `GetGprSeasons`
**Persisted Query Hash**: `c749e5ac23bd1614867cd86a8fc0eefec4b448bd986b2614e1ed7f85dfa2107f`

**Variables**:

```json
{
  "hl": "en-US",
  "sport": "lol"
}
```

**Note**: Based on console fragment warning "GprSeason already exists"

---

### 4. GetPickemsLeaguesSimple

**Purpose**: Fetch leagues for pick'ems
**Operation Name**: `GetPickemsLeaguesSimple`
**Persisted Query Hash**: `8ae8558bc72a34ed0fd3d00a9a43408515a67af016bddd8be4ddfbbd770c71da`

**Variables**:

```json
{
  "hl": "en-US"
}
```

---

### 5. GetSeasonForNavigation

**Purpose**: Fetch season data for navigation
**Operation Name**: `GetSeasonForNavigation`
**Persisted Query Hash**: `0d48d1f4929890f9b75b7e0d4306a6031b541316545b49ef7b8ddbeabe230e87`

**Variables**:

```json
{
  "hl": "en-US",
  "seasonId": "115547545029543948"
}
```

**Potential**: May contain season-level dates

---

## Console Fragment Warnings

During page load, these GraphQL fragments were reported as duplicates:

- `HomeLeague` - League-related data
- `GprSeason` - Global Power Rankings season data
- `HomeEventMatch` - Match data (already captured)
- `HomeEventShow` - Show/broadcast data

This suggests multiple operations use these fragments and may provide different views of the same data.

---

## Next Steps

1. **Test `homeLeagues` operation** - Most likely to contain tournament dates since leagues contain tournaments
2. **Test `GetSeasonForNavigation`** - May provide season-level date ranges
3. **Examine league IDs** - The numeric league IDs could be used to query specific league details
4. **Test with different variables** - Some operations may accept additional parameters not visible in initial load

---

## League IDs Found

From network traffic:

- First Stand: `113464388705111224`
- LEC: `98767975604431411`
- MSI: `98767991310872058`
- Worlds: `98767991325878492`

These match the slugs in LEAGUES.md and could be used to query league-specific data.
