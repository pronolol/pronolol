import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useMemo, useCallback, useEffect } from "react"
import MatchCard from "@/components/MatchCard"
import { useAuth } from "@/lib/auth-context"
import { signOut } from "@/lib/auth-client"
import { colors, spacing, borderRadius } from "@/components/ui/theme"
import { Typography } from "@/components/ui/Typography"
import { DayHeader } from "@/components/ui"
import {
  LoadingScreen,
  ErrorScreen,
  EmptyState,
} from "@/components/ui/ScreenStates"
import { useInfiniteQuery } from "@tanstack/react-query"
import { AXIOS_INSTANCE } from "@/api"
import type { Match } from "@/api"

// Fixed heights for getItemLayout (must match actual rendered heights)
const HEADER_HEIGHT = 48 // DayHeader height: paddingVertical(12*2) + badge(~24)
const MATCH_CARD_HEIGHT = 180 // MatchCard with padding: ~160 + padding(8*2)

// Item types for the flat list
type DayHeaderItem = {
  type: "header"
  id: string
  date: Date
}

type MatchItem = {
  type: "match"
  match: Match
}

type ListItem = DayHeaderItem | MatchItem

// Format time only (e.g., "14:00")
function formatTimeOnly(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

// Format date for display in completed matches
function formatMatchTime(date: Date, isCompleted: boolean): string {
  if (isCompleted) {
    return "Completed"
  }
  return formatTimeOnly(date)
}

// Convert matches to flat list with day headers
function createFlatListData(matches: Match[]): ListItem[] {
  const items: ListItem[] = []
  let currentDay: string | null = null

  matches.forEach((match) => {
    if (!match.matchDate) return
    const date = new Date(match.matchDate)
    const dayKey = date.toDateString()

    // Add header if this is a new day
    if (dayKey !== currentDay) {
      currentDay = dayKey
      items.push({
        type: "header",
        id: `header-${dayKey}`,
        date: date,
      })
    }

    items.push({
      type: "match",
      match: match,
    })
  })

  return items
}

// Find index of today's header (or nearest future)
function findTodayIndex(items: ListItem[]): number {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayStr = todayStart.toDateString()

  // Find today's header
  const todayIndex = items.findIndex(
    (item) => item.type === "header" && item.date.toDateString() === todayStr
  )
  if (todayIndex !== -1) return todayIndex

  // Find first future header
  const futureIndex = items.findIndex((item) => {
    if (item.type !== "header") return false
    const itemDate = new Date(
      item.date.getFullYear(),
      item.date.getMonth(),
      item.date.getDate()
    )
    return itemDate >= todayStart
  })
  if (futureIndex !== -1) return futureIndex

  // Default to 0
  return 0
}

type PageParam = { direction: string | null; cursor: string }

const PAGE_SIZE = 20

// Custom hook for bidirectional infinite loading
function useMatchesFeed() {
  return useInfiniteQuery<
    Match[],
    Error,
    { pages: Match[][]; pageParams: PageParam[] },
    string[],
    PageParam
  >({
    queryKey: ["matchesFeed"],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      params.set("limit", String(PAGE_SIZE))

      if (pageParam.direction) {
        params.set("direction", pageParam.direction)
        if (pageParam.cursor) {
          params.set("cursor", pageParam.cursor)
        }
      } else {
        // Initial load - get matches around now
        params.set("direction", "around")
        params.set("cursor", new Date().toISOString())
      }

      const response = await AXIOS_INSTANCE.get<Match[]>(`/matches?${params}`)
      return response.data
    },
    initialPageParam: { direction: null, cursor: "" },
    getNextPageParam: (lastPage): PageParam | undefined => {
      // No more pages if we got fewer results than requested or empty
      if (!lastPage || lastPage.length === 0 || lastPage.length < PAGE_SIZE) {
        return undefined
      }
      // Get the last match's date for "after" pagination
      const lastMatch = lastPage[lastPage.length - 1]
      if (!lastMatch.matchDate) return undefined
      return {
        direction: "after",
        cursor: lastMatch.matchDate,
      }
    },
    getPreviousPageParam: (firstPage): PageParam | undefined => {
      // No more pages if we got fewer results than requested or empty
      if (
        !firstPage ||
        firstPage.length === 0 ||
        firstPage.length < PAGE_SIZE
      ) {
        return undefined
      }
      // Get the first match's date for "before" pagination
      const firstMatch = firstPage[0]
      if (!firstMatch.matchDate) return undefined
      return {
        direction: "before",
        cursor: firstMatch.matchDate,
      }
    },
  })
}

export default function Index() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isSessionLoading } = useAuth()

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/(auth)/sign-in")
    }
  }, [isAuthenticated, isSessionLoading, router])

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useMatchesFeed()

  // Flatten all pages into a single array of matches (deduplicated)
  const allMatches = useMemo((): Match[] => {
    if (!data?.pages) return []
    const flatMatches = data.pages.flat()
    // Deduplicate matches by ID to avoid key conflicts
    const seen = new Set<string>()
    return flatMatches.filter((match) => {
      if (seen.has(match.id)) return false
      seen.add(match.id)
      return true
    })
  }, [data?.pages])

  // Create flat list data with headers and matches
  const listData = useMemo(() => {
    return createFlatListData(allMatches)
  }, [allMatches])

  // Find initial scroll index (today's header)
  const initialScrollIndex = useMemo(() => {
    if (listData.length === 0) return 0
    return findTodayIndex(listData)
  }, [listData])

  const handleSignOut = async () => {
    try {
      const result = await signOut()
      if (result.success || result.error) {
        router.replace("/(auth)/sign-in")
      }
    } catch (error) {
      console.error("Sign out error:", error)
      router.replace("/(auth)/sign-in")
    }
  }

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "header") {
        return <DayHeader date={item.date} />
      }

      const match = item.match
      const matchDate = match.matchDate ? new Date(match.matchDate) : null
      const isCompleted = match.state === "completed"

      return (
        <View style={styles.cardContainer}>
          <MatchCard
            teamA={{
              name: match.teamA.tag,
              logoUrl: match.teamA.logoUrl,
            }}
            teamB={{
              name: match.teamB.tag,
              logoUrl: match.teamB.logoUrl,
            }}
            matchTime={
              matchDate ? formatMatchTime(matchDate, isCompleted) : "TBD"
            }
            league={`${match.tournament.league.name} - ${match.tournament.name}`}
            score={
              match.teamAScore !== null && match.teamBScore !== null
                ? { teamA: match.teamAScore, teamB: match.teamBScore }
                : undefined
            }
            onPress={() => router.push(`/matches/${match.id}`)}
          />
        </View>
      )
    },
    [router]
  )

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Typography variant="label" color="secondary">
          Loading more matches...
        </Typography>
      </View>
    )
  }, [isFetchingNextPage])

  const keyExtractor = useCallback((item: ListItem) => {
    return item.type === "header" ? item.id : item.match.id
  }, [])

  const getItemLayout = useCallback(
    (data: ArrayLike<ListItem> | null | undefined, index: number) => {
      // Calculate offset by summing heights of all previous items
      let offset = 0
      if (data) {
        for (let i = 0; i < index && i < data.length; i++) {
          offset +=
            data[i].type === "header" ? HEADER_HEIGHT : MATCH_CARD_HEIGHT
        }
      }
      const item = data?.[index]
      const length = item?.type === "header" ? HEADER_HEIGHT : MATCH_CARD_HEIGHT
      return { length, offset, index }
    },
    []
  )

  if (isSessionLoading || isLoading) {
    return <LoadingScreen message="Loading matches..." />
  }

  if (error) {
    return (
      <ErrorScreen
        title="Error loading matches"
        message={
          error instanceof Error
            ? error.message
            : "Make sure the API is running"
        }
      />
    )
  }

  if (listData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          userName={
            user?.displayUsername || user?.username || user?.name || "User"
          }
          onSignOut={handleSignOut}
          onRankingsPress={() => router.push("/ranking")}
        />
        <EmptyState icon="calendar-outline" title="No matches found" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        userName={
          user?.displayUsername || user?.username || user?.name || "User"
        }
        onSignOut={handleSignOut}
        onRankingsPress={() => router.push("/ranking")}
      />

      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        initialScrollIndex={initialScrollIndex}
        getItemLayout={getItemLayout}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        // Performance optimizations
        removeClippedSubviews={false}
        maxToRenderPerBatch={15}
        windowSize={21}
        onScrollToIndexFailed={(info) => {
          // Handle scroll failure gracefully - no retry needed with proper getItemLayout
          console.warn("Scroll to index failed:", info.index)
        }}
      />
    </SafeAreaView>
  )
}

type HeaderProps = {
  userName: string
  onSignOut: () => void
  onRankingsPress: () => void
}

function Header({ userName, onSignOut, onRankingsPress }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <Typography variant="subtitle">Welcome, {userName}!</Typography>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.rankingsButton}
            onPress={onRankingsPress}
          >
            <Typography variant="label" color="primary">
              🏆 Rankings
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
            <Typography variant="label" color="secondary">
              Sign Out
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  headerButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  rankingsButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
    alignItems: "center",
  },
  signOutButton: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  cardContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  loadingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
})
