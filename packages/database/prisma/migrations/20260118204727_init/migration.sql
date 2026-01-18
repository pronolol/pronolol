-- CreateTable
CREATE TABLE "league" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "regionSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "league_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMPTZ,
    "endDate" TIMESTAMPTZ,
    "leagueId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "id" INTEGER NOT NULL,
    "matchDate" TIMESTAMPTZ NOT NULL,
    "state" TEXT NOT NULL,
    "bestOf" INTEGER NOT NULL,
    "stage" TEXT,
    "tournamentId" INTEGER NOT NULL,
    "teamAId" INTEGER NOT NULL,
    "teamBId" INTEGER NOT NULL,
    "winnerId" INTEGER,
    "teamAScore" INTEGER,
    "teamBScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

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
