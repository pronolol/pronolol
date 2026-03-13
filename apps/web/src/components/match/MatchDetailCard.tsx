import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type Team = {
  id: string
  name: string
  tag: string
  logoUrl: string
}

type MatchDetailCardProps = {
  teamA: Team
  teamB: Team
  teamAScore: number | null
  teamBScore: number | null
  bestOf: number
  matchDate: string | null
  state: string
  isPredictionLocked: boolean
  hasPredicted: boolean
  selectedTeamId: string | null
  predictedTeamId?: string
  onTeamSelect: (teamId: string) => void
}

type MatchStatus = "completed" | "live" | "upcoming"

function getStatus(state: string, isPredictionLocked: boolean): MatchStatus {
  if (state === "completed") return "completed"
  if (isPredictionLocked) return "live"
  return "upcoming"
}

const statusLabel: Record<MatchStatus, string> = {
  completed: "Completed",
  live: "Live",
  upcoming: "Upcoming",
}

const statusVariant: Record<MatchStatus, "completed" | "live" | "upcoming"> = {
  completed: "completed",
  live: "live",
  upcoming: "upcoming",
}

type TeamCardProps = {
  team: Team
  isSelected: boolean
  disabled: boolean
  onPress: () => void
}

function TeamCard({ team, isSelected, disabled, onPress }: TeamCardProps) {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
        isSelected
          ? "border-primary bg-primary-light"
          : "border-border bg-surface"
      } ${disabled ? "cursor-default opacity-80" : "hover:border-primary/50 hover:bg-primary-light/30 cursor-pointer"}`}
    >
      <div className="w-14 h-14 bg-text-primary rounded-xl p-2 flex items-center justify-center">
        <img
          src={team.logoUrl}
          alt={team.name}
          className="w-full h-full object-contain"
        />
      </div>
      <span className="font-bold text-sm">{team.tag}</span>
      <span className="text-xs text-text-secondary truncate max-w-[80px] text-center">
        {team.name}
      </span>
      {isSelected && (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  )
}

export function MatchDetailCard({
  teamA,
  teamB,
  teamAScore,
  teamBScore,
  bestOf,
  matchDate,
  state,
  isPredictionLocked,
  hasPredicted,
  selectedTeamId,
  onTeamSelect,
}: MatchDetailCardProps) {
  const status = getStatus(state, isPredictionLocked)
  const hasScore = teamAScore !== null && teamBScore !== null

  return (
    <Card>
      <div className="flex justify-center pt-4">
        <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
      </div>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <TeamCard
            team={teamA}
            isSelected={
              !hasPredicted &&
              !isPredictionLocked &&
              selectedTeamId === teamA.id
            }
            disabled={hasPredicted || isPredictionLocked}
            onPress={() => onTeamSelect(teamA.id)}
          />

          <div className="flex flex-col items-center gap-2 px-2">
            {hasScore ? (
              <div className="flex items-center gap-1">
                <span
                  className={`text-2xl font-extrabold ${teamAScore! > teamBScore! ? "text-text-primary" : "text-text-muted"}`}
                >
                  {teamAScore}
                </span>
                <span className="text-2xl font-extrabold text-text-muted">
                  :
                </span>
                <span
                  className={`text-2xl font-extrabold ${teamBScore! > teamAScore! ? "text-text-primary" : "text-text-muted"}`}
                >
                  {teamBScore}
                </span>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center">
                <span className="text-sm font-bold text-text-muted">VS</span>
              </div>
            )}
            <span className="text-xs bg-surface-secondary px-2 py-0.5 rounded text-text-secondary">
              BO{bestOf}
            </span>
          </div>

          <TeamCard
            team={teamB}
            isSelected={
              !hasPredicted &&
              !isPredictionLocked &&
              selectedTeamId === teamB.id
            }
            disabled={hasPredicted || isPredictionLocked}
            onPress={() => onTeamSelect(teamB.id)}
          />
        </div>

        {matchDate && (
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-xs text-text-secondary">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {new Date(matchDate).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
