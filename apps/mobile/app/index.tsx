import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useEffect } from "react"
import MatchCard from "@/components/MatchCard"
import { useGetMatches } from "@/api"
import { useAuth } from "@/lib/auth-context"
import { signOut } from "@/lib/auth-client"
import { colors, spacing, borderRadius } from "@/components/ui/theme"
import { Typography } from "@/components/ui/Typography"
import {
  LoadingScreen,
  ErrorScreen,
  EmptyState,
} from "@/components/ui/ScreenStates"

export default function Index() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isSessionLoading } = useAuth()

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/(auth)/sign-in")
    }
  }, [isAuthenticated, isSessionLoading, router])

  const {
    data: matches,
    isLoading,
    error,
  } = useGetMatches({
    limit: "20",
    state: "completed",
  })

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

  if (!matches || matches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          userName={
            user?.displayUsername || user?.username || user?.name || "User"
          }
          onSignOut={handleSignOut}
        />
        <EmptyState icon="calendar-outline" title="No upcoming matches found" />
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
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {matches?.map((match) => (
          <MatchCard
            key={match.id}
            teamA={{
              name: match.teamA.tag,
              logoUrl: match.teamA.logoUrl,
            }}
            teamB={{
              name: match.teamB.tag,
              logoUrl: match.teamB.logoUrl,
            }}
            matchTime={
              match.matchDate
                ? new Date(match.matchDate).toLocaleString()
                : "TBD"
            }
            league={`${match.tournament.league.name} - ${match.tournament.name}`}
            score={
              match.teamAScore !== null && match.teamBScore !== null
                ? { teamA: match.teamAScore, teamB: match.teamBScore }
                : undefined
            }
            onPress={() => router.push(`/matches/${match.id}`)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

type HeaderProps = {
  userName: string
  onSignOut: () => void
}

function Header({ userName, onSignOut }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <Typography variant="subtitle">Welcome, {userName}!</Typography>
        <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
          <Typography variant="label" color="secondary">
            Sign Out
          </Typography>
        </TouchableOpacity>
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
    alignItems: "center",
  },
  signOutButton: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
})
