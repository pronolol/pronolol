import { useMemo, useCallback, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useMatchesFeed } from "@/hooks/useMatchesFeed"
import { useGetUsersMePredictions } from "@/api/generated/users/users"
import { MatchCard } from "@/components/match/MatchCard"
import { DayHeader } from "@/components/match/DayHeader"
import { Skeleton } from "@/components/ui/skeleton"
import type { Match } from "@/api/generated/models"

type DayHeaderItem = { type: "header"; id: string; date: Date }
type MatchItem = { type: "match"; match: Match }
type ListItem = DayHeaderItem | MatchItem

function formatMatchTime(date: Date, isCompleted: boolean): string {
  if (isCompleted) return "Completed"
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function createListData(matches: Match[]): ListItem[] {
  const items: ListItem[] = []
  let currentDay: string | null = null

  for (const match of matches) {
    if (!match.matchDate) continue
    const date = new Date(match.matchDate)
    const dayKey = date.toDateString()

    if (dayKey !== currentDay) {
      currentDay = dayKey
      items.push({ type: "header", id: `header-${dayKey}`, date })
    }
    items.push({ type: "match", match })
  }

  return items
}

function findTodayIndex(items: ListItem[]): number {
  const todayStr = new Date().toDateString()
  const idx = items.findIndex(
    (item) => item.type === "header" && item.date.toDateString() === todayStr
  )
  if (idx !== -1) return idx

  const now = new Date()
  const futureIdx = items.findIndex((item) => {
    if (item.type !== "header") return false
    return item.date >= now
  })
  return futureIdx !== -1 ? futureIdx : 0
}

export function HomePage() {
  const navigate = useNavigate()
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    refetch,
    isRefetching,
  } = useMatchesFeed()

  const { data: myPredictions } = useGetUsersMePredictions()
  const predictionsByMatchId = useMemo(() => {
    if (!myPredictions) return new Map()
    return new Map(myPredictions.map((p) => [p.matchId, p]))
  }, [myPredictions])

  const allMatches = useMemo((): Match[] => {
    if (!data?.pages) return []
    const flat = data.pages.flat()
    const seen = new Set<string>()
    return flat.filter((m) => {
      if (seen.has(m.id)) return false
      seen.add(m.id)
      return true
    })
  }, [data?.pages])

  const listData = useMemo(() => createListData(allMatches), [allMatches])

  // Scroll to today on initial load
  const todayRef = useRef<HTMLDivElement | null>(null)
  const hasScrolled = useRef(false)
  useEffect(() => {
    if (!isLoading && listData.length > 0 && !hasScrolled.current) {
      hasScrolled.current = true
      const todayIndex = findTodayIndex(listData)
      if (todayIndex > 0) {
        setTimeout(() => {
          todayRef.current?.scrollIntoView({
            behavior: "instant",
            block: "start",
          })
        }, 50)
      }
    }
  }, [isLoading, listData])

  // Preserve scroll position when fetchPreviousPage prepends items above the
  // current viewport (without this the page jumps back to the top).
  const scrollHeightBeforeFetch = useRef(0)

  const triggerFetchPreviousPage = useCallback(() => {
    if (hasPreviousPage && !isFetchingPreviousPage) {
      scrollHeightBeforeFetch.current = document.documentElement.scrollHeight
      fetchPreviousPage()
    }
  }, [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage])

  useEffect(() => {
    if (!isFetchingPreviousPage && scrollHeightBeforeFetch.current > 0) {
      const delta =
        document.documentElement.scrollHeight - scrollHeightBeforeFetch.current
      window.scrollBy({ top: delta, behavior: "instant" })
      scrollHeightBeforeFetch.current = 0
    }
  }, [isFetchingPreviousPage])

  // The page scrolls on window, not on the feed div (the div has no fixed
  // height so it never overflows). Listen to window scroll instead.
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      const nearBottom = scrollHeight - scrollTop - clientHeight < 200
      const nearTop = scrollTop < 200

      if (nearBottom && hasNextPage && !isFetchingNextPage) fetchNextPage()
      if (nearTop) triggerFetchPreviousPage()
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, triggerFetchPreviousPage])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-text-secondary">Failed to load matches</p>
        <button
          onClick={() => refetch()}
          className="text-primary text-sm font-medium hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (listData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <p className="text-text-secondary">No matches found</p>
      </div>
    )
  }

  let todayRefSet = false

  return (
    <div className="flex flex-col gap-0">
      {isFetchingPreviousPage && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {isRefetching && (
        <div className="text-center py-2 text-xs text-text-muted">
          Refreshing...
        </div>
      )}
      {listData.map((item) => {
        if (item.type === "header") {
          const isToday = item.date.toDateString() === new Date().toDateString()
          const refProps =
            isToday && !todayRefSet
              ? {
                  ref: (el: HTMLDivElement | null) => {
                    todayRef.current = el
                    todayRefSet = true
                  },
                }
              : {}
          return (
            <div key={item.id} {...refProps}>
              <DayHeader date={item.date} />
            </div>
          )
        }

        const match = item.match
        const matchDate = match.matchDate ? new Date(match.matchDate) : null
        const isCompleted = match.state === "completed"

        const myPrediction = predictionsByMatchId.get(match.id)

        return (
          <div key={match.id} className="px-0 py-1.5">
            <MatchCard
              teamA={{ name: match.teamA.tag, logoUrl: match.teamA.logoUrl }}
              teamB={{ name: match.teamB.tag, logoUrl: match.teamB.logoUrl }}
              matchTime={
                matchDate ? formatMatchTime(matchDate, isCompleted) : "TBD"
              }
              league={`${match.tournament.league.name} - ${match.tournament.name}`}
              score={
                match.teamAScore !== null && match.teamBScore !== null
                  ? { teamA: match.teamAScore, teamB: match.teamBScore }
                  : undefined
              }
              prediction={
                myPrediction
                  ? {
                      teamTag: myPrediction.team.tag,
                      teamLogoUrl: myPrediction.team.logoUrl,
                      scoreA: myPrediction.predictedTeamAScore,
                      scoreB: myPrediction.predictedTeamBScore,
                      isCorrect: myPrediction.isCorrect,
                      isExact: myPrediction.isExact,
                    }
                  : undefined
              }
              onPress={() => navigate(`/matches/${match.id}`)}
            />
          </div>
        )
      })}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
}
