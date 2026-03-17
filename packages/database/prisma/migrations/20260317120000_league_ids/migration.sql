-- AlterTable: replace leagueId/tournamentId with leagueIds array
ALTER TABLE "user_preferences"
  DROP COLUMN IF EXISTS "leagueId",
  DROP COLUMN IF EXISTS "tournamentId",
  ADD COLUMN "leagueIds" TEXT[] NOT NULL DEFAULT '{}';
