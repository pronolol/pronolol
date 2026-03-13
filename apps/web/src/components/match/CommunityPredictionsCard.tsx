import { Card, CardContent } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import type { Prediction } from "@/api/predictions"

type CommunityPredictionsCardProps = {
  predictions: Prediction[]
  isMatchCompleted: boolean
}

function getResultStyle(prediction: Prediction, isMatchCompleted: boolean) {
  if (!isMatchCompleted || prediction.points === null) return null
  if (prediction.isExact)
    return {
      bg: "bg-success-light",
      text: "text-success-dark",
      icon: "🏆",
    }
  if (prediction.isCorrect)
    return {
      bg: "bg-primary-light",
      text: "text-primary",
      icon: "✓",
    }
  return {
    bg: "bg-error-light",
    text: "text-error",
    icon: "✗",
  }
}

export function CommunityPredictionsCard({
  predictions,
  isMatchCompleted,
}: CommunityPredictionsCardProps) {
  const exactCount = predictions.filter((p) => p.isExact === true).length
  const correctCount = predictions.filter(
    (p) => p.isCorrect === true && p.isExact !== true
  ).length
  const wrongCount = predictions.filter((p) => p.isCorrect === false).length

  return (
    <Card>
      <div className="flex items-center gap-2 px-4 pt-4 pb-0">
        <svg
          className="w-5 h-5 text-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h3 className="font-semibold text-sm">Community Predictions</h3>
        <span className="ml-auto text-xs bg-background-secondary text-text-secondary px-2 py-0.5 rounded-full">
          {predictions.length}
        </span>
      </div>

      {isMatchCompleted && (
        <div className="flex gap-4 px-4 py-3 border-b border-border-light">
          <div className="flex items-center gap-1.5 text-xs text-success">
            <span>🏆</span>
            <span>{exactCount} Exact</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary">
            <span>✓</span>
            <span>{correctCount} Correct</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-error">
            <span>✗</span>
            <span>{wrongCount} Wrong</span>
          </div>
        </div>
      )}

      <CardContent className="pt-2 flex flex-col gap-1">
        {predictions.map((prediction) => {
          const resultStyle = getResultStyle(prediction, isMatchCompleted)
          const userName =
            prediction.user?.displayUsername ||
            prediction.user?.username ||
            prediction.user?.name ||
            "Anonymous"

          return (
            <div
              key={prediction.id}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${resultStyle?.bg || ""}`}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Avatar
                  src={prediction.user?.image}
                  name={userName}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userName}</p>
                  {isMatchCompleted && prediction.points !== null && (
                    <p className={`text-xs ${resultStyle?.text}`}>
                      +{prediction.points} pts
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-text-primary rounded p-0.5 flex items-center justify-center">
                  <img
                    src={prediction.team.logoUrl}
                    alt={prediction.team.tag}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-text-secondary bg-surface-secondary px-2 py-0.5 rounded">
                  {prediction.predictedTeamAScore}-
                  {prediction.predictedTeamBScore}
                </span>
                {resultStyle && (
                  <span className={`text-sm ${resultStyle.text}`}>
                    {resultStyle.icon}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
