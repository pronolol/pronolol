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
    <div className="relative">
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
        <button
          onClick={onClearLeagues}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            allSelected
              ? "bg-primary text-white shadow-sm"
              : "bg-surface text-text-secondary border border-border hover:border-primary/50 hover:text-primary hover:bg-primary/5"
          }`}
        >
          All
        </button>
        {leagues.map((league) => {
          const isActive = selectedLeagueIds.includes(league.id)
          return (
            <button
              key={league.id}
              onClick={() => onLeagueToggle(league.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface text-text-secondary border border-border hover:border-primary/50 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {league.imageUrl && (
                <div className="w-3.5 h-3.5 bg-logo-bg rounded-sm p-px flex items-center justify-center shrink-0">
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
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background-secondary to-transparent" />
    </div>
  )
}
