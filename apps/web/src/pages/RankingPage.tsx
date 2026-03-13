import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useGetRanking } from "@/api/generated/rankings/rankings"
import { AXIOS_INSTANCE } from "@/api/client"
import { useInfiniteQuery } from "@tanstack/react-query"
import { RankingTable } from "@/components/ranking/RankingTable"
import { Skeleton } from "@/components/ui/skeleton"
import type { Match } from "@/api/generated/models"

type PageParam = { direction: string | null; cursor: string }

interface FilterOption {
  label: string
  value: string | null
}

function extractLeagues(matches: Match[]): FilterOption[] {
  const map = new Map<string, string>()
  for (const match of matches) {
    const league = match.tournament?.league
    if (league?.id && league?.name) map.set(league.id, league.name)
  }
  const result: FilterOption[] = [{ label: "All Leagues", value: null }]
  map.forEach((name, id) => result.push({ label: name, value: id }))
  return result
}

function extractTournaments(
  matches: Match[],
  leagueId?: string | null
): FilterOption[] {
  const map = new Map<string, string>()
  for (const match of matches) {
    const t = match.tournament
    if (t?.id && t?.name) {
      if (!leagueId || t.league?.id === leagueId) map.set(t.id, t.name)
    }
  }
  const result: FilterOption[] = [{ label: "All Tournaments", value: null }]
  map.forEach((name, id) => result.push({ label: name, value: id }))
  return result
}

export function RankingPage() {
  const { user } = useAuth()
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  const [selectedTournament, setSelectedTournament] = useState<string | null>(
    null
  )

  const { data: matchesData } = useInfiniteQuery<
    Match[],
    Error,
    { pages: Match[][]; pageParams: PageParam[] },
    string[],
    PageParam
  >({
    queryKey: ["matchesFeed"],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      params.set("limit", "100")
      if (pageParam.direction) {
        params.set("direction", pageParam.direction)
        if (pageParam.cursor) params.set("cursor", pageParam.cursor)
      } else {
        params.set("direction", "around")
        params.set("cursor", new Date().toISOString())
      }
      const response = await AXIOS_INSTANCE.get<Match[]>(`/matches?${params}`)
      return response.data
    },
    initialPageParam: { direction: null, cursor: "" },
    getNextPageParam: () => undefined,
  })

  const allMatches = useMemo((): Match[] => {
    if (!matchesData?.pages) return []
    return matchesData.pages.flat()
  }, [matchesData?.pages])

  const leagueOptions = useMemo(() => extractLeagues(allMatches), [allMatches])
  const tournamentOptions = useMemo(
    () => extractTournaments(allMatches, selectedLeague),
    [allMatches, selectedLeague]
  )

  const rankingParams = {
    ...(selectedLeague && { leagueId: selectedLeague }),
    ...(selectedTournament && { tournamentId: selectedTournament }),
  }

  const {
    data: rankingData,
    isLoading,
    error,
    refetch,
  } = useGetRanking(rankingParams)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full rounded-lg" />
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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Rankings</h1>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={selectedLeague ?? ""}
          onChange={(e) => {
            setSelectedLeague(e.target.value || null)
            setSelectedTournament(null)
          }}
          className="flex-1 h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {leagueOptions.map((opt) => (
            <option key={opt.value ?? "all"} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={selectedTournament ?? ""}
          onChange={(e) => setSelectedTournament(e.target.value || null)}
          className="flex-1 h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {tournamentOptions.map((opt) => (
            <option key={opt.value ?? "all"} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {rankingData?.rankings && rankingData.rankings.length > 0 ? (
        <RankingTable entries={rankingData.rankings} currentUserId={user?.id} />
      ) : (
        <div className="text-center py-12 text-text-secondary">
          <p className="font-medium">No Rankings Yet</p>
          <p className="text-sm mt-1">
            Make predictions to appear in the rankings!
          </p>
        </div>
      )}
    </div>
  )
}
