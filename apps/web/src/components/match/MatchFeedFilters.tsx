import type { LeagueOption, TournamentOption } from "@/hooks/useMatchFilters"

interface MatchFeedFiltersProps {
  leagues: LeagueOption[]
  tournaments: TournamentOption[]
  selectedLeagueId: string | null
  selectedTournamentId: string | null
  onLeagueChange: (leagueId: string | null) => void
  onTournamentChange: (tournamentId: string | null) => void
}

export const MatchFeedFilters = ({
  leagues,
  tournaments,
  selectedLeagueId,
  selectedTournamentId,
  onLeagueChange,
  onTournamentChange,
}: MatchFeedFiltersProps) => {
  if (leagues.length === 0) return null

  return (
    <div className="flex flex-col gap-2 pb-3">
      {/* League pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onLeagueChange(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedLeagueId === null
              ? "bg-primary text-white"
              : "bg-surface text-text-secondary border border-border hover:border-primary hover:text-primary"
          }`}
        >
          All leagues
        </button>
        {leagues.map((league) => (
          <button
            key={league.id}
            onClick={() => onLeagueChange(league.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedLeagueId === league.id
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
        ))}
      </div>

      {/* Tournament selector — only shown when a league is selected */}
      {selectedLeagueId !== null && tournaments.length > 0 && (
        <select
          value={selectedTournamentId ?? ""}
          onChange={(e) => onTournamentChange(e.target.value || null)}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 w-full"
        >
          <option value="">All tournaments</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
