import { Pool } from "pg";
import {
  ScraperOutput,
  NormalizedLeague,
  NormalizedTeam,
  NormalizedTournament,
  NormalizedMatch,
} from "../types";

import "dotenv/config";

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
    });

    this.pool.on("error", (err, client) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });
  }

  async saveScrapedData(data: ScraperOutput): Promise<void> {
    console.error("💾 Saving data to the database...");

    // The order is important to respect foreign key constraints.
    await this.upsertLeagues(data.leagues);
    await this.upsertTeams(data.teams);
    await this.upsertTournaments(data.tournaments);
    await this.upsertMatches(data.matches);

    console.error("✅ Database save complete.");
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  private async upsertLeagues(leagues: NormalizedLeague[]): Promise<void> {
    if (leagues.length === 0) return;

    for (const league of leagues) {
      const query = `
        INSERT INTO leagues (id, name, image_url, region, region_slug)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          image_url = EXCLUDED.image_url;
      `;
      await this.pool.query(query, [
        league.id,
        league.name,
        league.image,
        league.region,
        league.regionSlug,
      ]);
    }
    console.error(`\tUpserted ${leagues.length} leagues.`);
  }

  private async upsertTeams(teams: NormalizedTeam[]): Promise<void> {
    if (teams.length === 0) return;

    for (const team of teams) {
      // The team with id '0' is a placeholder for TBD teams, skip it.
      if (team.id === "0") continue;
      const query = `
        INSERT INTO teams (id, name, tag, logo_url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          tag = EXCLUDED.tag,
          logo_url = EXCLUDED.logo_url;
      `;
      await this.pool.query(query, [team.id, team.name, team.tag, team.logo]);
    }
    console.error(`\tUpserted ${teams.length} teams.`);
  }

  private async upsertTournaments(
    tournaments: NormalizedTournament[]
  ): Promise<void> {
    if (tournaments.length === 0) return;

    for (const tournament of tournaments) {
      const query = `
        INSERT INTO tournaments (id, name, start_date, end_date, league_id, type)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          league_id = EXCLUDED.league_id;
      `;
      await this.pool.query(query, [
        tournament.id,
        tournament.name,
        tournament.startTime,
        tournament.endTime,
        tournament.league.id,
        tournament.type,
      ]);
    }
    console.error(`\tUpserted ${tournaments.length} tournaments.`);
  }

  private async upsertMatches(matches: NormalizedMatch[]): Promise<void> {
    if (matches.length === 0) return;

    for (const match of matches) {
      // Skip matches involving a TBD team
      if (match.team1.id === "0" || match.team2.id === "0") continue;
      const query = `
        INSERT INTO matches (id, match_date, state, best_of, stage, tournament_id, team1_id, team2_id, winner_id, team1_score, team2_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          state = EXCLUDED.state,
          winner_id = EXCLUDED.winner_id,
          team1_score = EXCLUDED.team1_score,
          team2_score = EXCLUDED.team2_score,
          match_date = EXCLUDED.match_date;
      `;

      await this.pool.query(query, [
        match.id,
        match.date,
        match.state,
        match.bestOf,
        match.stage,
        match.tournament.id,
        match.team1.id,
        match.team2.id,
        match.result?.winner,
        match.result?.team1Score,
        match.result?.team2Score,
      ]);
    }
    console.error(`   Upserted ${matches.length} matches.`);
  }
}
