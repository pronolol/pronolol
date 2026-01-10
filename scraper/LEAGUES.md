# Available League of Legends Esports Leagues

This document lists all available leagues that can be scraped from lolesports.com.

## International Leagues

- **First Stand** - `first_stand`
- **MSI** (Mid-Season Invitational) - `msi`
- **Worlds** (World Championship) - `worlds`

## Major Regional Leagues

- **LCS** (League Championship Series - Americas) - `lcs`
- **LEC** (League of Legends European Championship) - `lec`
- **LCK** (League of Legends Champions Korea) - `lck`
- **LPL** (League of Legends Pro League - China) - `lpl`
- **CBLOL** (Brazilian Championship) - `cblol-brazil`
- **PCS** (Pacific Championship Series) - `pcs`

## Regional Leagues

### Americas

- **LCP** - `lcp`
- **NACL** (North American Challengers League) - `nacl`
- **Circuito Desafiante** - `cd`

### Europe

- **EMEA Masters** - `emea_masters`
- **NLC** (Northern League of Legends Championship) - `nlc`
- **La Ligue Française (LFL)** - `lfl`
- **Prime League** (Germany) - `primeleague`
- **SuperLiga** (Spain) - `superliga`
- **Liga Portuguesa** (Portugal) - `liga_portuguesa`
- **LoL Italian Tournament** - `lit`
- **Hitpoint Masters** - `hitpoint_masters`
- **Esports Balkan League** - `esports_balkan_league`
- **Hellenic Legends League** (Greece) - `hellenic_legends_league`
- **Road of Legends** - `roadoflegends`
- **Rift Legends** - `rift_legends`

### Asia-Pacific

- **LJL** (League of Legends Japan League) - `ljl-japan`
- **LCK Challengers** - `lck_challengers_league`

### Other

- **TCL** (Turkish Championship League) - `turkiye-sampiyonluk-ligi`
- **Arabian League** - `arabian_league`
- **LRN** (North Regional League) - `north_regional_league`
- **LRS** (South Regional League) - `south_regional_league`
- **TFT Esports** (Teamfight Tactics) - `tft_esports`

## Usage Examples

### Single League

```bash
# Scrape only LCK
npm run scrape -- --leagues lck > lck_data.json 2> lck_errors.log

# Scrape only LFL
npm run scrape -- --leagues lfl > lfl_data.json 2> lfl_errors.log
```

### Multiple Leagues

```bash
# Scrape LCK, LPL, and LCS
npm run scrape -- --leagues lck,lpl,lcs > major_leagues.json 2> errors.log

# Scrape all European leagues
npm run scrape -- --leagues lec,lfl,primeleague,superliga,nlc > eu_leagues.json 2> errors.log
```

### Default Behavior

If no `--leagues` flag is specified, the scraper uses:

- `first_stand`
- `lec`
- `msi`
- `worlds`

## Notes

- League slugs must be comma-separated without spaces
- Some leagues are seasonal and may not have active matches year-round
- TFT Esports is for Teamfight Tactics, not traditional League of Legends
- The API accepts multiple league slugs in a single request
