/*
  Warnings:

  - The primary key for the `league` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `match` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `team` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `tournament` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_teamAId_fkey";

-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_teamBId_fkey";

-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_winnerId_fkey";

-- DropForeignKey
ALTER TABLE "prediction" DROP CONSTRAINT "prediction_matchId_fkey";

-- DropForeignKey
ALTER TABLE "prediction" DROP CONSTRAINT "prediction_teamId_fkey";

-- DropForeignKey
ALTER TABLE "tournament" DROP CONSTRAINT "tournament_leagueId_fkey";

-- AlterTable
ALTER TABLE "league" DROP CONSTRAINT "league_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "league_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "match" DROP CONSTRAINT "match_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tournamentId" SET DATA TYPE TEXT,
ALTER COLUMN "teamAId" SET DATA TYPE TEXT,
ALTER COLUMN "teamBId" SET DATA TYPE TEXT,
ALTER COLUMN "winnerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "match_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "prediction" ALTER COLUMN "matchId" SET DATA TYPE TEXT,
ALTER COLUMN "teamId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "team" DROP CONSTRAINT "team_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "team_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tournament" DROP CONSTRAINT "tournament_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "leagueId" SET DATA TYPE TEXT,
ADD CONSTRAINT "tournament_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction" ADD CONSTRAINT "prediction_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction" ADD CONSTRAINT "prediction_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
