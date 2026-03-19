import { useState, useEffect, useMemo } from "react"
import type { Match } from "@/api/generated/models"
import { useCreatePrediction } from "@/api/predictions"
import { computeAllScores } from "@/hooks/usePredictionWizard"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Phase = "predicting" | "review-skipped" | "done"
type ScoreOption = { teamA: number; teamB: number }

interface PredictionWizardModalProps {
  isOpen: boolean
  currentMatch: Match | null
  progress: { done: number; total: number }
  phase: Phase
  skippedCount: number
  onSkip: () => void
  onAdvance: () => void
  onStartReview: () => void
  onClose: () => void
}

interface ScoreTileProps {
  score: ScoreOption
  isPending: boolean
  isSuccess: boolean
  isDisabled: boolean
  onClick: () => void
}

const ScoreTile = ({
  score,
  isPending,
  isSuccess,
  isDisabled,
  onClick,
}: ScoreTileProps) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={cn(
      "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
      "border-border bg-background-secondary hover:bg-primary/10 hover:border-primary",
      isDisabled &&
        !isPending &&
        !isSuccess &&
        "opacity-40 cursor-not-allowed hover:bg-background-secondary hover:border-border",
      isSuccess && "bg-green-500/10 border-green-500 text-green-600"
    )}
  >
    {isPending ? (
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    ) : isSuccess ? (
      "✓"
    ) : (
      `${score.teamA}-${score.teamB}`
    )}
  </button>
)

export const PredictionWizardModal = ({
  isOpen,
  currentMatch,
  progress,
  phase,
  skippedCount,
  onSkip,
  onAdvance,
  onStartReview,
  onClose,
}: PredictionWizardModalProps) => {
  const [pendingScore, setPendingScore] = useState<ScoreOption | null>(null)
  const [successScore, setSuccessScore] = useState<ScoreOption | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createPrediction = useCreatePrediction(currentMatch?.id ?? "")

  useEffect(() => {
    setPendingScore(null)
    setSuccessScore(null)
    setSubmitError(null)
  }, [currentMatch?.id])

  const scores = useMemo(
    () =>
      currentMatch
        ? computeAllScores(currentMatch.bestOf)
        : { teamAWins: [], teamBWins: [] },
    [currentMatch]
  )

  const handleScoreClick = async (score: ScoreOption, teamId: string) => {
    if (pendingScore || successScore) return
    setPendingScore(score)
    setSubmitError(null)
    try {
      await createPrediction.mutateAsync({
        teamId,
        predictedTeamAScore: score.teamA,
        predictedTeamBScore: score.teamB,
      })
      setPendingScore(null)
      setSuccessScore(score)
      setTimeout(() => {
        setSuccessScore(null)
        onAdvance()
      }, 600)
    } catch (err) {
      setPendingScore(null)
      setSubmitError((err as Error)?.message ?? "Failed to submit prediction")
    }
  }

  if (!isOpen) return null

  if (phase === "done") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-6 p-8">
        <p className="text-2xl font-bold text-center">All caught up! 🎉</p>
        <Button onClick={onClose}>Close</Button>
      </div>
    )
  }

  if (phase === "review-skipped") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-6 p-8">
        <p className="text-xl font-semibold text-center">
          You skipped {skippedCount} match{skippedCount === 1 ? "" : "es"} —
          Review them?
        </p>
        <div className="flex gap-3">
          <Button onClick={onStartReview}>Review</Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    )
  }

  if (!currentMatch) return null

  const isActionBlocked = !!(pendingScore || successScore)

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-text-secondary">
          Match {progress.done + 1}/{progress.total}
        </span>
        <button
          onClick={onClose}
          className="text-sm text-text-secondary hover:text-text-primary font-medium"
        >
          ✕ Exit
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto w-full">
        {/* League + tournament */}
        <div className="text-center">
          <p className="font-semibold">{currentMatch.tournament.league.name}</p>
          <p className="text-sm text-text-secondary">
            {currentMatch.tournament.name}
          </p>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center gap-10">
          <div className="flex flex-col items-center gap-2">
            <img
              src={currentMatch.teamA.logoUrl}
              alt={currentMatch.teamA.tag}
              className="w-14 h-14 object-contain"
            />
            <span className="font-semibold text-sm">
              {currentMatch.teamA.tag}
            </span>
          </div>
          <span className="text-text-muted text-sm font-medium">vs</span>
          <div className="flex flex-col items-center gap-2">
            <img
              src={currentMatch.teamB.logoUrl}
              alt={currentMatch.teamB.tag}
              className="w-14 h-14 object-contain"
            />
            <span className="font-semibold text-sm">
              {currentMatch.teamB.tag}
            </span>
          </div>
        </div>

        {/* Score grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 mb-1">
              <img
                src={currentMatch.teamA.logoUrl}
                alt=""
                className="w-4 h-4 object-contain"
              />
              <span className="text-xs font-medium text-text-secondary">
                {currentMatch.teamA.tag} wins
              </span>
            </div>
            {scores.teamAWins.map((score) => {
              const key = `a-${score.teamA}-${score.teamB}`
              const isPending =
                pendingScore?.teamA === score.teamA &&
                pendingScore?.teamB === score.teamB
              const isSuccess =
                successScore?.teamA === score.teamA &&
                successScore?.teamB === score.teamB
              return (
                <ScoreTile
                  key={key}
                  score={score}
                  isPending={isPending}
                  isSuccess={isSuccess}
                  isDisabled={isActionBlocked}
                  onClick={() => handleScoreClick(score, currentMatch.teamA.id)}
                />
              )
            })}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 mb-1">
              <img
                src={currentMatch.teamB.logoUrl}
                alt=""
                className="w-4 h-4 object-contain"
              />
              <span className="text-xs font-medium text-text-secondary">
                {currentMatch.teamB.tag} wins
              </span>
            </div>
            {scores.teamBWins.map((score) => {
              const key = `b-${score.teamA}-${score.teamB}`
              const isPending =
                pendingScore?.teamA === score.teamA &&
                pendingScore?.teamB === score.teamB
              const isSuccess =
                successScore?.teamA === score.teamA &&
                successScore?.teamB === score.teamB
              return (
                <ScoreTile
                  key={key}
                  score={score}
                  isPending={isPending}
                  isSuccess={isSuccess}
                  isDisabled={isActionBlocked}
                  onClick={() => handleScoreClick(score, currentMatch.teamB.id)}
                />
              )
            })}
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-red-500 text-center">{submitError}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <button
          onClick={onSkip}
          disabled={isActionBlocked}
          className={cn(
            "w-full text-sm text-text-secondary hover:text-text-primary font-medium py-2",
            isActionBlocked && "opacity-40 cursor-not-allowed"
          )}
        >
          Skip →
        </button>
      </div>
    </div>
  )
}
