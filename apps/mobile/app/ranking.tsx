import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useState, useCallback, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { colors, spacing, borderRadius } from "@/components/ui/theme"
import { Typography } from "@/components/ui/Typography"
import { Avatar, Card } from "@/components/ui"
import {
  LoadingScreen,
  ErrorScreen,
  EmptyState,
} from "@/components/ui/ScreenStates"
import { useGetRanking, type RankingEntry, type GetRankingParams } from "@/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { AXIOS_INSTANCE, type Match } from "@/api"

interface FilterOption {
  label: string
  value: string | null
}

// Helper to extract unique leagues from matches
function extractLeagues(matches: Match[]): FilterOption[] {
  const leaguesMap = new Map<string, string>()
  matches.forEach((match) => {
    const league = match.tournament?.league
    if (league?.id && league?.name) {
      leaguesMap.set(league.id, league.name)
    }
  })
  const leagues: FilterOption[] = [{ label: "All Leagues", value: null }]
  leaguesMap.forEach((name, id) => {
    leagues.push({ label: name, value: id })
  })
  return leagues
}

// Helper to extract unique tournaments from matches
function extractTournaments(matches: Match[], leagueId?: string | null): FilterOption[] {
  const tournamentsMap = new Map<string, string>()
  matches.forEach((match) => {
    const tournament = match.tournament
    if (tournament?.id && tournament?.name) {
      // If leagueId is specified, only include tournaments from that league
      if (!leagueId || tournament.league?.id === leagueId) {
        tournamentsMap.set(tournament.id, tournament.name)
      }
    }
  })
  const tournaments: FilterOption[] = [{ label: "All Tournaments", value: null }]
  tournamentsMap.forEach((name, id) => {
    tournaments.push({ label: name, value: id })
  })
  return tournaments
}

export default function RankingScreen() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null)
  const [showLeagueFilter, setShowLeagueFilter] = useState(false)
  const [showTournamentFilter, setShowTournamentFilter] = useState(false)

  // Fetch matches to get leagues and tournaments for filters
  const { data: matchesData } = useInfiniteQuery<Match[]>({
    queryKey: ["matchesFeed"],
    queryFn: async ({ pageParam = { direction: null, cursor: "" } }) => {
      const params = new URLSearchParams()
      params.set("limit", "100")
      if ((pageParam as any).direction) {
        params.set("direction", (pageParam as any).direction)
        if ((pageParam as any).cursor) {
          params.set("cursor", (pageParam as any).cursor)
        }
      } else {
        params.set("direction", "around")
        params.set("cursor", new Date().toISOString())
      }
      const response = await AXIOS_INSTANCE.get<Match[]>(`/matches?${params}`)
      return response.data
    },
    initialPageParam: { direction: null, cursor: "" },
    getNextPageParam: () => undefined, // Only load first page for filters
  })

  // Flatten matches for filter options
  const allMatches = useMemo((): Match[] => {
    if (!matchesData?.pages) return []
    return matchesData.pages.flat()
  }, [matchesData?.pages])

  // Extract filter options
  const leagueOptions = useMemo(() => extractLeagues(allMatches), [allMatches])
  const tournamentOptions = useMemo(
    () => extractTournaments(allMatches, selectedLeague),
    [allMatches, selectedLeague]
  )

  // Fetch ranking data
  const rankingParams: GetRankingParams = {
    ...(selectedLeague && { leagueId: selectedLeague }),
    ...(selectedTournament && { tournamentId: selectedTournament }),
  }
  
  const {
    data: rankingData,
    isLoading,
    error,
    refetch,
  } = useGetRanking(rankingParams)

  const handleLeagueSelect = useCallback((value: string | null) => {
    setSelectedLeague(value)
    setSelectedTournament(null) // Reset tournament when league changes
    setShowLeagueFilter(false)
  }, [])

  const handleTournamentSelect = useCallback((value: string | null) => {
    setSelectedTournament(value)
    setShowTournamentFilter(false)
  }, [])

  const renderRankingItem = useCallback(
    ({ item }: { item: RankingEntry }) => {
      const isCurrentUser = item.userId === user?.id
      
      return (
        <Card style={[styles.rankingCard, isCurrentUser && styles.currentUserCard]}>
          <View style={styles.rankContainer}>
            {/* Rank Medal/Number */}
            <View
              style={[
                styles.rankBadge,
                item.rank === 1 && styles.rank1Badge,
                item.rank === 2 && styles.rank2Badge,
                item.rank === 3 && styles.rank3Badge,
              ]}
            >
              <Typography
                variant="title"
                style={[styles.rankText, item.rank <= 3 && styles.rankTextMedal]}
              >
                {item.rank <= 3 ? ["🥇", "🥈", "🥉"][item.rank - 1] : item.rank}
              </Typography>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Avatar source={item.image} name={item.displayName} size="md" />
              <View style={styles.userTextContainer}>
                <Typography variant="body" numberOfLines={1}>
                  {item.displayName}
                  {isCurrentUser && (
                    <Typography variant="label" color="secondary">
                      {" "}(You)
                    </Typography>
                  )}
                </Typography>
                <Typography variant="label" color="secondary">
                  {item.totalPredictions} prediction{item.totalPredictions !== 1 ? "s" : ""}
                </Typography>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Typography variant="title" style={styles.pointsText}>
                  {item.totalPoints}
                </Typography>
                <Typography variant="label" color="secondary">
                  pts
                </Typography>
              </View>
              <View style={styles.statItem}>
                <Typography variant="title" style={styles.percentageText}>
                  {item.correctnessPercentage}%
                </Typography>
                <Typography variant="label" color="secondary">
                  correct
                </Typography>
              </View>
            </View>
          </View>

          {/* Detailed Stats */}
          <View style={styles.detailedStats}>
            <View style={styles.detailedStatItem}>
              <Typography variant="label" color="secondary">
                Correct: {item.correctPredictions}
              </Typography>
            </View>
            <View style={styles.detailedStatItem}>
              <Typography variant="label" color="secondary">
                Exact: {item.exactPredictions}
              </Typography>
            </View>
          </View>
        </Card>
      )
    },
    [user?.id]
  )

  const renderFilterButton = (
    label: string,
    selectedValue: string | null,
    options: FilterOption[],
    onPress: () => void
  ) => {
    const selectedOption = options.find((opt) => opt.value === selectedValue)
    return (
      <TouchableOpacity style={styles.filterButton} onPress={onPress}>
        <Typography variant="body" numberOfLines={1} style={styles.filterButtonText}>
          {selectedOption?.label || label}
        </Typography>
        <Typography variant="body" color="secondary">
          ▼
        </Typography>
      </TouchableOpacity>
    )
  }

  const renderFilterModal = (
    visible: boolean,
    options: FilterOption[],
    selectedValue: string | null,
    onSelect: (value: string | null) => void,
    onClose: () => void
  ) => {
    if (!visible) return null

    return (
      <View style={styles.filterModalOverlay}>
        <TouchableOpacity
          style={styles.filterModalBackdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={styles.filterModal}>
          <ScrollView style={styles.filterList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value || "all"}
                style={[
                  styles.filterOption,
                  option.value === selectedValue && styles.filterOptionSelected,
                ]}
                onPress={() => onSelect(option.value)}
              >
                <Typography
                  variant="body"
                  color={option.value === selectedValue ? "primary" : undefined}
                >
                  {option.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    )
  }

  if (isLoading) {
    return <LoadingScreen message="Loading rankings..." />
  }

  if (error) {
    return (
      <ErrorScreen
        message="Failed to load rankings"
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Typography variant="title" color="primary">
            ←
          </Typography>
        </TouchableOpacity>
        <Typography variant="display">Rankings</Typography>
        <View style={styles.backButton} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {renderFilterButton(
          "League",
          selectedLeague,
          leagueOptions,
          () => setShowLeagueFilter(true)
        )}
        {renderFilterButton(
          "Tournament",
          selectedTournament,
          tournamentOptions,
          () => setShowTournamentFilter(true)
        )}
      </View>

      {/* Ranking List */}
      {rankingData?.rankings && rankingData.rankings.length > 0 ? (
        <FlatList
          data={rankingData.rankings}
          renderItem={renderRankingItem}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="No Rankings Yet"
          message="Make predictions to appear in the rankings!"
        />
      )}

      {/* Filter Modals */}
      {renderFilterModal(
        showLeagueFilter,
        leagueOptions,
        selectedLeague,
        handleLeagueSelect,
        () => setShowLeagueFilter(false)
      )}
      {renderFilterModal(
        showTournamentFilter,
        tournamentOptions,
        selectedTournament,
        handleTournamentSelect,
        () => setShowTournamentFilter(false)
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonText: {
    flex: 1,
    marginRight: spacing.xs,
  },
  filterModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  filterModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  filterModal: {
    position: "absolute",
    top: "20%",
    left: spacing.lg,
    right: spacing.lg,
    maxHeight: "60%",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterList: {
    maxHeight: 400,
  },
  filterOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  listContainer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  rankingCard: {
    padding: spacing.md,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  rank1Badge: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  rank2Badge: {
    backgroundColor: "#C0C0C0",
    borderColor: "#C0C0C0",
  },
  rank3Badge: {
    backgroundColor: "#CD7F32",
    borderColor: "#CD7F32",
  },
  rankText: {
    fontWeight: "bold",
  },
  rankTextMedal: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  userTextContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statItem: {
    alignItems: "center",
  },
  pointsText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  percentageText: {
    color: colors.success,
    fontWeight: "bold",
  },
  detailedStats: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailedStatItem: {
    flex: 1,
  },
})
