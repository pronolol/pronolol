import { ScrollView, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useState, useMemo } from "react"
import { useGetMatchesId, useGetPredictions, useCreatePrediction } from "@/api"
import { colors, spacing } from "@/components/ui/theme"
import {
  LoadingScreen,
  ErrorScreen,
  EmptyState,
} from "@/components/ui/ScreenStates"
import {
  MatchHeader,
  MatchDetailCard,
  ScoreSelectionCard,
  PromptCard,
  MyPredictionCard,
  CommunityPredictionsCard,
} from "@/components/matches"

type ScoreOption = { teamA: number; teamB: number }

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  // Fetch match data by ID
  const { data: match, isLoading: isLoadingMatch } = useGetMatchesId(id!)

  // Fetch predictions
  const { data: predictionsData, isLoading: isLoadingPredictions } =
    useGetPredictions(id!)
  const myPrediction = predictionsData?.myPrediction
  const allPredictions = predictionsData?.predictions

  // Mutation for creating prediction
  const createPrediction = useCreatePrediction(id!)

  // Local state for prediction form
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [selectedScore, setSelectedScore] = useState<ScoreOption | null>(null)

  // Calculate if predictions are locked
  const isPredictionLocked = useMemo(() => {
    if (!match?.matchDate) return false
    const lockTime = new Date(
      new Date(match.matchDate).getTime() + 5 * 60 * 1000
    )
    return new Date() > lockTime
  }, [match?.matchDate])

  // Generate possible scores based on bestOf
  const possibleScores = useMemo((): ScoreOption[] => {
    if (!match || !selectedTeamId) return []

    const maxWins = Math.ceil(match.bestOf / 2)
    const isTeamA = selectedTeamId === match.teamA.id
    const scores: ScoreOption[] = []

    for (let loserScore = 0; loserScore < maxWins; loserScore++) {
      scores.push({
        teamA: isTeamA ? maxWins : loserScore,
        teamB: isTeamA ? loserScore : maxWins,
      })
    }

    return scores
  }, [match, selectedTeamId])

  const handleSubmitPrediction = async () => {
    if (!selectedTeamId || !selectedScore) return

    try {
      await createPrediction.mutateAsync({
        teamId: selectedTeamId,
        predictedTeamAScore: selectedScore.teamA,
        predictedTeamBScore: selectedScore.teamB,
      })
      setSelectedTeamId(null)
      setSelectedScore(null)
    } catch (error) {
      console.error("Failed to create prediction:", error)
    }
  }

  const handleTeamSelect = (teamId: string) => {
    if (hasPredicted || isPredictionLocked) return
    if (selectedTeamId === teamId) {
      setSelectedTeamId(null)
      setSelectedScore(null)
    } else {
      setSelectedTeamId(teamId)
      setSelectedScore(null)
    }
  }

  // Loading state
  if (isLoadingMatch || isLoadingPredictions) {
    return <LoadingScreen message="Loading match..." />
  }

  // Error state
  if (!match) {
    return (
      <ErrorScreen
        title="Match not found"
        onRetry={() => router.back()}
        retryLabel="Go Back"
      />
    )
  }

  const hasPredicted = !!myPrediction
  const isMatchCompleted = match.state === "completed"
  const selectedTeam =
    selectedTeamId === match.teamA.id ? match.teamA : match.teamB

  return (
    <SafeAreaView style={styles.container}>
      <MatchHeader
        leagueName={match.tournament.league.name}
        tournamentName={match.tournament.name}
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <MatchDetailCard
          teamA={match.teamA}
          teamB={match.teamB}
          teamAScore={match.teamAScore}
          teamBScore={match.teamBScore}
          bestOf={match.bestOf}
          matchDate={match.matchDate}
          state={match.state}
          isPredictionLocked={isPredictionLocked}
          hasPredicted={hasPredicted}
          selectedTeamId={selectedTeamId}
          predictedTeamId={myPrediction?.teamId}
          onTeamSelect={handleTeamSelect}
        />

        {/* Score Selection */}
        {!hasPredicted && !isPredictionLocked && selectedTeamId && (
          <ScoreSelectionCard
            selectedTeam={selectedTeam}
            possibleScores={possibleScores}
            selectedScore={selectedScore}
            onSelectScore={setSelectedScore}
            onSubmit={handleSubmitPrediction}
            isSubmitting={createPrediction.isPending}
            error={
              createPrediction.isError
                ? (createPrediction.error as any)?.message ||
                  "Failed to submit prediction"
                : null
            }
          />
        )}

        {/* Prompt to select team */}
        {!hasPredicted && !isPredictionLocked && !selectedTeamId && (
          <PromptCard
            icon="rocket-outline"
            title="Make Your Prediction"
            message="Tap on the team you think will win"
          />
        )}

        {/* Locked message */}
        {!hasPredicted && isPredictionLocked && (
          <PromptCard
            icon="lock-closed"
            title="Predictions Locked"
            message="This match has already started"
            variant="warning"
          />
        )}

        {/* User's prediction */}
        {hasPredicted && myPrediction && (
          <MyPredictionCard
            prediction={myPrediction}
            isMatchCompleted={isMatchCompleted}
          />
        )}

        {/* Community predictions */}
        {(hasPredicted || isMatchCompleted) &&
          allPredictions &&
          allPredictions.length > 0 && (
            <CommunityPredictionsCard
              predictions={allPredictions}
              isMatchCompleted={isMatchCompleted}
            />
          )}

        {/* Empty predictions state */}
        {(hasPredicted || isMatchCompleted) &&
          (!allPredictions || allPredictions.length === 0) && (
            <EmptyState
              icon="people-outline"
              title="Be the first to predict!"
            />
          )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
})
