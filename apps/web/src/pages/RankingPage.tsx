import { useState, useMemo } from "react"
import { keepPreviousData } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth-context"
import {
  useGetRanking,
  useGetRankingFilters,
} from "@/api/generated/rankings/rankings"
import { RankingTable } from "@/components/ranking/RankingTable"
import { Skeleton } from "@/components/ui/skeleton"
import {
  buildLeagueOptions,
  buildTournamentOptions,
} from "@/lib/ranking-filters"

const selectClassName =
  "flex-1 min-w-0 h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"

export const RankingPage = () => {
  const { user } = useAuth()
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  const [selectedTournament, setSelectedTournament] = useState<string | null>(
    null
  )

  const { data: filters } = useGetRankingFilters()

  const leagueOptions = useMemo(
    () => buildLeagueOptions(filters ?? []),
    [filters]
  )
  const tournamentOptions = useMemo(
    () => buildTournamentOptions(filters ?? [], selectedLeague),
    [filters, selectedLeague]
  )

  const rankingParams = {
    ...(selectedLeague && { leagueId: selectedLeague }),
    ...(selectedTournament && { tournamentId: selectedTournament }),
  }

  const {
    data: rankingData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetRanking(rankingParams, {
    query: { placeholderData: keepPreviousData },
  })

  const renderRankings = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-3" data-testid="ranking-skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <p className="text-text-secondary">Failed to load rankings</p>
          <button
            onClick={() => refetch()}
            className="text-primary text-sm font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      )
    }

    if (rankingData?.rankings && rankingData.rankings.length > 0) {
      return (
        <div
          className={isFetching ? "opacity-60 transition-opacity" : undefined}
        >
          <RankingTable
            entries={rankingData.rankings}
            currentUserId={user?.id}
          />
        </div>
      )
    }

    return (
      <div className="text-center py-12 text-text-secondary">
        <p className="font-medium">No Rankings Yet</p>
        <p className="text-sm mt-1">
          Make predictions to appear in the rankings!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Rankings</h1>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          aria-label="League"
          value={selectedLeague ?? ""}
          onChange={(e) => {
            setSelectedLeague(e.target.value || null)
            setSelectedTournament(null)
          }}
          className={selectClassName}
        >
          {leagueOptions.map((opt) => (
            <option key={opt.value ?? "all"} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Tournament"
          value={selectedTournament ?? ""}
          onChange={(e) => setSelectedTournament(e.target.value || null)}
          className={selectClassName}
        >
          {tournamentOptions.map((opt) => (
            <option key={opt.value ?? "all"} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {renderRankings()}
    </div>
  )
}
