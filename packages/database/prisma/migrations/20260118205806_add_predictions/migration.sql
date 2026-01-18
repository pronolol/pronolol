-- CreateTable
CREATE TABLE "prediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "predictedTeamAScore" INTEGER NOT NULL,
    "predictedTeamBScore" INTEGER NOT NULL,
    "isCorrect" BOOLEAN,
    "isExact" BOOLEAN,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prediction_userId_matchId_key" ON "prediction"("userId", "matchId");

-- AddForeignKey
ALTER TABLE "prediction" ADD CONSTRAINT "prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction" ADD CONSTRAINT "prediction_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction" ADD CONSTRAINT "prediction_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
