import { Card } from "@/components/ui/card"

type Team = {
  name: string
  logoUrl: string
}

type MatchScore = {
  teamA: number
  teamB: number
}

type PredictionBadge = {
  teamTag: string
  teamLogoUrl: string
  scoreA: number
  scoreB: number
  isCorrect: boolean | null
  isExact: boolean | null
}

type MatchCardProps = {
  teamA: Team
  teamB: Team
  matchTime?: string
  league?: string
  score?: MatchScore
  prediction?: PredictionBadge
  onPress?: () => void
}

function TeamDisplay({ team }: { team: Team }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="w-14 h-14 bg-text-primary rounded-xl p-2 flex items-center justify-center">
        <img
          src={team.logoUrl}
          alt={team.name}
          className="w-full h-full object-contain"
        />
      </div>
      <span className="font-bold text-sm text-center truncate max-w-[80px]">
        {team.name}
      </span>
    </div>
  )
}

export function MatchCard({
  teamA,
  teamB,
  matchTime,
  league,
  score,
  prediction,
  onPress,
}: MatchCardProps) {
  return (
    <Card
      className={`overflow-hidden ${onPress ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onPress}
      role={onPress ? "button" : undefined}
      tabIndex={onPress ? 0 : undefined}
      onKeyDown={onPress ? (e) => e.key === "Enter" && onPress() : undefined}
    >
      {league && (
        <div className="bg-surface-secondary px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            {league}
          </span>
          {prediction && (
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                prediction.isExact
                  ? "bg-success-light text-success-dark"
                  : prediction.isCorrect
                    ? "bg-primary-light text-primary"
                    : prediction.isCorrect === false
                      ? "bg-error-light text-error"
                      : "bg-surface text-text-secondary border border-border"
              }`}
            >
              <div className="w-5 h-5 bg-text-primary rounded p-0.5 flex items-center justify-center">
                <img
                  src={prediction.teamLogoUrl}
                  alt={prediction.teamTag}
                  className="w-full h-full object-contain"
                />
              </div>
              <span>
                {prediction.teamTag} {prediction.scoreA}-{prediction.scoreB}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-5">
        <TeamDisplay team={teamA} />
        <div className="flex flex-col items-center justify-center px-4 gap-1">
          {score ? (
            <>
              <span className="text-2xl font-bold text-text-primary">
                {score.teamA} - {score.teamB}
              </span>
              {matchTime && (
                <span className="text-xs text-text-muted">{matchTime}</span>
              )}
            </>
          ) : (
            <>
              <span className="text-xs font-extrabold text-text-muted uppercase">
                VS
              </span>
              {matchTime && (
                <span className="text-xs text-text-muted">{matchTime}</span>
              )}
            </>
          )}
        </div>
        <TeamDisplay team={teamB} />
      </div>
    </Card>
  )
}
