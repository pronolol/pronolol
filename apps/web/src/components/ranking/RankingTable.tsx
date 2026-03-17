import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import type { RankingEntry } from "@/api/generated/models"

export type { RankingEntry }

type RankingTableProps = {
  entries: RankingEntry[]
  currentUserId?: string
}

const MEDAL_EMOJI = ["🥇", "🥈", "🥉"]

const rankBadgeClass: Record<number, string> = {
  1: "bg-yellow-400 border-yellow-400",
  2: "bg-gray-300 border-gray-300",
  3: "bg-amber-600 border-amber-600",
}

export const RankingTable = ({ entries, currentUserId }: RankingTableProps) => {
  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => {
        const isCurrentUser = entry.userId === currentUserId
        const isMedal = entry.rank <= 3

        return (
          <Card
            key={entry.userId}
            className={`p-3 ${isCurrentUser ? "border-2 border-primary bg-primary-light/30" : ""}`}
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  isMedal
                    ? rankBadgeClass[entry.rank]
                    : "bg-surface border-border"
                }`}
              >
                {isMedal ? (
                  <span className="text-2xl">
                    {MEDAL_EMOJI[entry.rank - 1]}
                  </span>
                ) : (
                  <span className="font-bold text-text-primary">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* User info */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Avatar src={entry.image} name={entry.displayName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {entry.displayName}
                    {isCurrentUser && (
                      <span className="text-text-secondary font-normal">
                        {" "}
                        (You)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {entry.totalPredictions} prediction
                    {entry.totalPredictions !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 flex-shrink-0">
                <div className="text-center">
                  <p className="font-bold text-primary">{entry.totalPoints}</p>
                  <p className="text-xs text-text-secondary">pts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-success">
                    {entry.correctnessPercentage}%
                  </p>
                  <p className="text-xs text-text-secondary">correct</p>
                </div>
              </div>
            </div>

            {/* Detailed stats */}
            <div className="mt-2 pt-2 border-t border-border flex gap-4">
              <p className="text-xs text-text-secondary">
                Correct: {entry.correctPredictions}
              </p>
              <p className="text-xs text-text-secondary">
                Exact: {entry.exactPredictions}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
