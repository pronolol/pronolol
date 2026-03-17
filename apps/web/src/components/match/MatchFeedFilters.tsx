import type { LeagueOption } from "@/hooks/useMatchFilters"

interface MatchFeedFiltersProps {
  leagues: LeagueOption[]
  selectedLeagueIds: string[]
  onLeagueToggle: (leagueId: string) => void
  onClearLeagues: () => void
}

export const MatchFeedFilters = ({
  leagues,
  selectedLeagueIds,
  onLeagueToggle,
  onClearLeagues,
}: MatchFeedFiltersProps) => {
  if (leagues.length === 0) return null

  const allSelected = selectedLeagueIds.length === 0

  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      <button
        onClick={onClearLeagues}
        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          allSelected
            ? "bg-primary text-white"
            : "bg-surface text-text-secondary border border-border hover:border-primary hover:text-primary"
        }`}
      >
        All leagues
      </button>
      {leagues.map((league) => {
        const isActive = selectedLeagueIds.includes(league.id)
        return (
          <button
            key={league.id}
            onClick={() => onLeagueToggle(league.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary border border-border hover:border-primary hover:text-primary"
            }`}
          >
            {league.imageUrl && (
              <div className="w-3.5 h-3.5 bg-text-primary rounded-sm p-px flex items-center justify-center shrink-0">
                <img
                  src={league.imageUrl}
                  alt={league.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            {league.name}
          </button>
        )
      })}
    </div>
  )
}
