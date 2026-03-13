import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useGetMatchesId } from "@/api/generated/matches/matches"
import { useGetPredictions, useCreatePrediction } from "@/api/predictions"
import { MatchDetailCard } from "@/components/match/MatchDetailCard"
import {
  ScoreSelectionCard,
  PromptCard,
} from "@/components/match/ScoreSelectionCard"
import { MyPredictionCard } from "@/components/match/MyPredictionCard"
import { CommunityPredictionsCard } from "@/components/match/CommunityPredictionsCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

type ScoreOption = { teamA: number; teamB: number }

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: match, isLoading: isLoadingMatch } = useGetMatchesId(id!)
  const { data: predictionsData, isLoading: isLoadingPredictions } =
    useGetPredictions(id!)
  const createPrediction = useCreatePrediction(id!)

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [selectedScore, setSelectedScore] = useState<ScoreOption | null>(null)

  const isPredictionLocked = useMemo(() => {
    if (!match?.matchDate) return false
    const lockTime = new Date(
      new Date(match.matchDate).getTime() + 5 * 60 * 1000
    )
    return new Date() > lockTime
  }, [match?.matchDate])

  const possibleScores = useMemo((): ScoreOption[] => {
    if (!match || !selectedTeamId) return []
    const maxWins = Math.ceil(match.bestOf / 2)
    const isTeamA = selectedTeamId === match.teamA.id
    const scores: ScoreOption[] = []
    for (let loserScore = 0; loserScore < maxWins; loserScore++) {
      scores.push({
        teamA: isTeamA ? maxWins : loserScore,
        teamB: isTeamA ? loserScore : maxWins,
      })
    }
    return scores
  }, [match, selectedTeamId])

  const handleSubmitPrediction = async () => {
    if (!selectedTeamId || !selectedScore) return
    try {
      await createPrediction.mutateAsync({
        teamId: selectedTeamId,
        predictedTeamAScore: selectedScore.teamA,
        predictedTeamBScore: selectedScore.teamB,
      })
      setSelectedTeamId(null)
      setSelectedScore(null)
    } catch (err) {
      console.error("Failed to create prediction:", err)
    }
  }

  const handleTeamSelect = (teamId: string) => {
    if (hasPredicted || isPredictionLocked) return
    if (selectedTeamId === teamId) {
      setSelectedTeamId(null)
      setSelectedScore(null)
    } else {
      setSelectedTeamId(teamId)
      setSelectedScore(null)
    }
  }

  if (isLoadingMatch || isLoadingPredictions) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-text-secondary">Match not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    )
  }

  const myPrediction = predictionsData?.myPrediction
  const allPredictions = predictionsData?.predictions
  const hasPredicted = !!myPrediction
  const isMatchCompleted = match.state === "completed"
  const selectedTeam =
    selectedTeamId === match.teamA.id ? match.teamA : match.teamB

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Button>
        <div>
          <p className="font-semibold text-sm">
            {match.tournament.league.name}
          </p>
          <p className="text-xs text-text-secondary">{match.tournament.name}</p>
        </div>
      </div>

      <MatchDetailCard
        teamA={match.teamA}
        teamB={match.teamB}
        teamAScore={match.teamAScore}
        teamBScore={match.teamBScore}
        bestOf={match.bestOf}
        matchDate={match.matchDate}
        state={match.state}
        isPredictionLocked={isPredictionLocked}
        hasPredicted={hasPredicted}
        selectedTeamId={selectedTeamId}
        predictedTeamId={myPrediction?.teamId}
        onTeamSelect={handleTeamSelect}
      />

      {!hasPredicted && !isPredictionLocked && selectedTeamId && (
        <ScoreSelectionCard
          selectedTeam={selectedTeam}
          possibleScores={possibleScores}
          selectedScore={selectedScore}
          onSelectScore={setSelectedScore}
          onSubmit={handleSubmitPrediction}
          isSubmitting={createPrediction.isPending}
          error={
            createPrediction.isError
              ? (createPrediction.error as Error)?.message ||
                "Failed to submit prediction"
              : null
          }
        />
      )}

      {!hasPredicted && !isPredictionLocked && !selectedTeamId && (
        <PromptCard
          title="Make Your Prediction"
          message="Click on the team you think will win"
        />
      )}

      {!hasPredicted && isPredictionLocked && match.state !== "completed" && (
        <PromptCard
          title="Predictions Locked"
          message="This match has already started"
          variant="warning"
        />
      )}

      {hasPredicted && myPrediction && (
        <MyPredictionCard
          prediction={myPrediction}
          isMatchCompleted={isMatchCompleted}
        />
      )}

      {(hasPredicted || isPredictionLocked || isMatchCompleted) &&
        allPredictions &&
        allPredictions.length > 0 && (
          <CommunityPredictionsCard
            predictions={allPredictions}
            isMatchCompleted={isMatchCompleted}
          />
        )}

      {!hasPredicted &&
        (isPredictionLocked || isMatchCompleted) &&
        (!allPredictions || allPredictions.length === 0) && (
          <div className="text-center py-8 text-text-secondary text-sm">
            No predictions for this match yet.
          </div>
        )}
    </div>
  )
}
