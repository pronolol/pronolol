import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Prediction } from "@/api/predictions"

type MyPredictionCardProps = {
  prediction: Prediction
  isMatchCompleted: boolean
}

function getResult(
  prediction: Prediction,
  isMatchCompleted: boolean
): "exact" | "correct" | "wrong" | null {
  if (!isMatchCompleted) return null
  if (prediction.isExact) return "exact"
  if (prediction.isCorrect) return "correct"
  return "wrong"
}

const resultStyles = {
  exact: {
    badgeVariant: "success" as const,
    label: "Exact",
    borderClass: "border-success",
    pointsClass: "text-success",
  },
  correct: {
    badgeVariant: "primary" as const,
    label: "Correct",
    borderClass: "border-primary",
    pointsClass: "text-primary",
  },
  wrong: {
    badgeVariant: "error" as const,
    label: "Wrong",
    borderClass: "border-error",
    pointsClass: "text-error",
  },
}

export function MyPredictionCard({
  prediction,
  isMatchCompleted,
}: MyPredictionCardProps) {
  const result = getResult(prediction, isMatchCompleted)
  const style = result ? resultStyles[result] : null

  return (
    <Card
      className={`border-2 bg-success-light/30 ${style?.borderClass || "border-success"}`}
    >
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            <span className="font-semibold text-sm">Your Prediction</span>
          </div>
          {result && style && (
            <Badge variant={style.badgeVariant}>{style.label}</Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-11 h-11 bg-text-primary rounded-xl p-1.5 flex items-center justify-center">
              <img
                src={prediction.team.logoUrl}
                alt={prediction.team.tag}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-sm">{prediction.team.tag}</p>
              <p className="text-xs text-text-muted">Winner</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-text-muted">Score</p>
            <p className="font-bold text-base">
              {prediction.predictedTeamAScore} - {prediction.predictedTeamBScore}
            </p>
          </div>

          {prediction.points !== null && (
            <div className="text-center">
              <p className="text-xs text-text-muted">Points</p>
              <p className={`font-bold text-base ${style?.pointsClass || "text-primary"}`}>
                +{prediction.points}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
