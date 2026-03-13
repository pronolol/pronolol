import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type ScoreOption = {
  teamA: number
  teamB: number
}

type Team = {
  id: string
  tag: string
  logoUrl: string
}

type ScoreSelectionCardProps = {
  selectedTeam: Team
  possibleScores: ScoreOption[]
  selectedScore: ScoreOption | null
  onSelectScore: (score: ScoreOption) => void
  onSubmit: () => void
  isSubmitting: boolean
  error?: string | null
}

export function ScoreSelectionCard({
  selectedTeam,
  possibleScores,
  selectedScore,
  onSelectScore,
  onSubmit,
  isSubmitting,
  error,
}: ScoreSelectionCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Predict the Score</h3>
          <div className="flex items-center gap-1.5 bg-primary-light px-2.5 py-1 rounded-full">
            <img
              src={selectedTeam.logoUrl}
              alt={selectedTeam.tag}
              className="w-4 h-4 object-contain"
            />
            <span className="text-xs font-medium text-primary">
              {selectedTeam.tag} wins
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {possibleScores.map((score, index) => {
            const isSelected =
              selectedScore?.teamA === score.teamA &&
              selectedScore?.teamB === score.teamB
            return (
              <button
                key={index}
                onClick={() => onSelectScore(score)}
                className={`px-5 py-2.5 rounded-full border-2 font-medium text-sm transition-all ${
                  isSelected
                    ? "bg-primary border-primary text-white"
                    : "bg-surface-secondary border-border text-text-primary hover:border-primary/50"
                }`}
              >
                {score.teamA} - {score.teamB}
              </button>
            )
          })}
        </div>

        {selectedScore && (
          <Button
            className="w-full"
            onClick={onSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Submit Prediction
          </Button>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-error-light rounded-lg">
            <svg
              className="w-4 h-4 text-error flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs text-error">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type PromptCardProps = {
  title: string
  message: string
  variant?: "default" | "warning"
}

export function PromptCard({
  title,
  message,
  variant = "default",
}: PromptCardProps) {
  const isWarning = variant === "warning"
  return (
    <Card
      className={`text-center py-6 ${isWarning ? "bg-warning-light border-warning" : ""}`}
    >
      <CardContent className="flex flex-col items-center gap-2">
        <div
          className={`text-3xl ${isWarning ? "text-warning" : "text-primary"}`}
        >
          {isWarning ? "🔒" : "🚀"}
        </div>
        <h3
          className={`font-semibold ${isWarning ? "text-warning-dark" : "text-primary"}`}
        >
          {title}
        </h3>
        <p className="text-xs text-text-secondary">{message}</p>
      </CardContent>
    </Card>
  )
}
