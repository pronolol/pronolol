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
    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
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
              <img
                src={league.imageUrl}
                alt={league.name}
                className="w-3.5 h-3.5 rounded-full object-cover"
              />
            )}
            {league.name}
          </button>
        )
      })}
    </div>
  )
}
