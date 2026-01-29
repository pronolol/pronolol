import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useState, useMemo } from "react";
import { useGetMatches, useGetPredictions, useCreatePrediction } from "@/api";
import { useSession } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";

type ScoreOption = { teamA: number; teamB: number };

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch match data
  const { data: matches, isLoading: isLoadingMatch } = useGetMatches({});
  const match = matches?.find((m) => m.id === id);

  // Fetch predictions (includes myPrediction and all predictions)
  const { data: predictionsData, isLoading: isLoadingPredictions } = useGetPredictions(id!);
  const myPrediction = predictionsData?.myPrediction;
  const allPredictions = predictionsData?.predictions;

  // Mutation for creating prediction
  const createPrediction = useCreatePrediction(id!);

  // Local state for prediction form
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState<ScoreOption | null>(null);

  // Calculate if predictions are locked
  const isPredictionLocked = useMemo(() => {
    if (!match?.matchDate) return false;
    const lockTime = new Date(new Date(match.matchDate).getTime() + 5 * 60 * 1000);
    return new Date() > lockTime;
  }, [match?.matchDate]);

  // Generate possible scores based on bestOf
  const possibleScores = useMemo((): ScoreOption[] => {
    if (!match || !selectedTeamId) return [];

    const maxWins = Math.ceil(match.bestOf / 2);
    const isTeamA = selectedTeamId === match.teamA.id;
    const scores: ScoreOption[] = [];

    for (let loserScore = 0; loserScore < maxWins; loserScore++) {
      scores.push({
        teamA: isTeamA ? maxWins : loserScore,
        teamB: isTeamA ? loserScore : maxWins,
      });
    }

    return scores;
  }, [match, selectedTeamId]);

  const handleSubmitPrediction = async () => {
    if (!selectedTeamId || !selectedScore) return;

    try {
      await createPrediction.mutateAsync({
        teamId: selectedTeamId,
        predictedTeamAScore: selectedScore.teamA,
        predictedTeamBScore: selectedScore.teamB,
      });
      setSelectedTeamId(null);
      setSelectedScore(null);
    } catch (error) {
      console.error("Failed to create prediction:", error);
    }
  };

  const handleTeamSelect = (teamId: string) => {
    if (hasPredicted || isPredictionLocked) return;
    if (selectedTeamId === teamId) {
      setSelectedTeamId(null);
      setSelectedScore(null);
    } else {
      setSelectedTeamId(teamId);
      setSelectedScore(null);
    }
  };

  if (isLoadingMatch || isLoadingPredictions) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading match...</Text>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={48} color="#dc3545" />
        <Text style={styles.errorText}>Match not found</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const hasPredicted = !!myPrediction;
  const isMatchCompleted = match.state === "completed";
  const selectedTeam = selectedTeamId === match.teamA.id ? match.teamA : match.teamB;

  // Get prediction result status
  const getPredictionStatus = () => {
    if (!myPrediction || !isMatchCompleted) return null;
    if (myPrediction.isExact) return { label: "Exact!", color: "#10b981", icon: "trophy" };
    if (myPrediction.isCorrect) return { label: "Correct", color: "#6366f1", icon: "checkmark-circle" };
    return { label: "Wrong", color: "#ef4444", icon: "close-circle" };
  };
  const predictionStatus = getPredictionStatus();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{match.tournament.league.name}</Text>
          <Text style={styles.headerSubtitle}>{match.tournament.name}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Match Card */}
        <View style={styles.matchCard}>
          {/* Match Status Badge */}
          <View style={styles.statusBadgeContainer}>
            {isMatchCompleted ? (
              <View style={[styles.statusBadge, styles.statusCompleted]}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" />
                <Text style={styles.statusBadgeText}>Completed</Text>
              </View>
            ) : isPredictionLocked ? (
              <View style={[styles.statusBadge, styles.statusLive]}>
                <View style={styles.liveDot} />
                <Text style={styles.statusBadgeText}>In Progress</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, styles.statusUpcoming]}>
                <Ionicons name="time-outline" size={14} color="#fff" />
                <Text style={styles.statusBadgeText}>Upcoming</Text>
              </View>
            )}
          </View>

          {/* Teams */}
          <View style={styles.teamsContainer}>
            {/* Team A */}
            <TouchableOpacity
              style={[
                styles.teamCard,
                !hasPredicted && !isPredictionLocked && selectedTeamId === match.teamA.id && styles.teamCardSelected,
                hasPredicted && myPrediction?.teamId === match.teamA.id && styles.teamCardPredicted,
              ]}
              onPress={() => handleTeamSelect(match.teamA.id)}
              disabled={hasPredicted || isPredictionLocked}
              activeOpacity={hasPredicted || isPredictionLocked ? 1 : 0.7}
            >
              {!hasPredicted && !isPredictionLocked && selectedTeamId === match.teamA.id && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
              <View style={styles.teamLogoContainer}>
                <Image source={match.teamA.logoUrl} style={styles.teamLogo} contentFit="contain" />
              </View>
              <Text style={styles.teamTag}>{match.teamA.tag}</Text>
              <Text style={styles.teamName} numberOfLines={1}>{match.teamA.name}</Text>
            </TouchableOpacity>

            {/* Score / VS */}
            <View style={styles.matchScoreContainer}>
              {match.teamAScore !== null && match.teamBScore !== null ? (
                <View style={styles.scoreBox}>
                  <Text style={[
                    styles.scoreNumber,
                    match.teamAScore > match.teamBScore && styles.scoreWinner
                  ]}>
                    {match.teamAScore}
                  </Text>
                  <Text style={styles.scoreDivider}>:</Text>
                  <Text style={[
                    styles.scoreNumber,
                    match.teamBScore > match.teamAScore && styles.scoreWinner
                  ]}>
                    {match.teamBScore}
                  </Text>
                </View>
              ) : (
                <View style={styles.vsBox}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
              )}
              <Text style={styles.bestOfBadge}>BO{match.bestOf}</Text>
            </View>

            {/* Team B */}
            <TouchableOpacity
              style={[
                styles.teamCard,
                !hasPredicted && !isPredictionLocked && selectedTeamId === match.teamB.id && styles.teamCardSelected,
                hasPredicted && myPrediction?.teamId === match.teamB.id && styles.teamCardPredicted,
              ]}
              onPress={() => handleTeamSelect(match.teamB.id)}
              disabled={hasPredicted || isPredictionLocked}
              activeOpacity={hasPredicted || isPredictionLocked ? 1 : 0.7}
            >
              {!hasPredicted && !isPredictionLocked && selectedTeamId === match.teamB.id && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
              <View style={styles.teamLogoContainer}>
                <Image source={match.teamB.logoUrl} style={styles.teamLogo} contentFit="contain" />
              </View>
              <Text style={styles.teamTag}>{match.teamB.tag}</Text>
              <Text style={styles.teamName} numberOfLines={1}>{match.teamB.name}</Text>
            </TouchableOpacity>
          </View>

          {/* Match Date */}
          {match.matchDate && (
            <View style={styles.matchDateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#6c757d" />
              <Text style={styles.matchDateText}>
                {new Date(match.matchDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Prediction Form - Score Selection */}
        {!hasPredicted && !isPredictionLocked && selectedTeamId && (
          <View style={styles.scoreSelectionCard}>
            <View style={styles.scoreSelectionHeader}>
              <Text style={styles.sectionTitle}>Predict the Score</Text>
              <View style={styles.selectedTeamBadge}>
                <Image source={selectedTeam.logoUrl} style={styles.miniLogo} contentFit="contain" />
                <Text style={styles.selectedTeamText}>{selectedTeam.tag} wins</Text>
              </View>
            </View>

            <View style={styles.scoresGrid}>
              {possibleScores.map((score, index) => {
                const isSelected = selectedScore?.teamA === score.teamA && selectedScore?.teamB === score.teamB;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.scorePill, isSelected && styles.scorePillSelected]}
                    onPress={() => setSelectedScore(score)}
                  >
                    <Text style={[styles.scorePillText, isSelected && styles.scorePillTextSelected]}>
                      {score.teamA} - {score.teamB}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedScore && (
              <TouchableOpacity
                style={[styles.submitButton, createPrediction.isPending && styles.submitButtonDisabled]}
                onPress={handleSubmitPrediction}
                disabled={createPrediction.isPending}
              >
                {createPrediction.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Prediction</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {createPrediction.isError && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#dc3545" />
                <Text style={styles.errorMessage}>
                  {(createPrediction.error as any)?.message || "Failed to submit prediction"}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Select Team Prompt */}
        {!hasPredicted && !isPredictionLocked && !selectedTeamId && (
          <View style={styles.promptCard}>
            <Ionicons name="hand-left-outline" size={32} color="#6366f1" />
            <Text style={styles.promptTitle}>Make Your Prediction</Text>
            <Text style={styles.promptText}>Tap on the team you think will win</Text>
          </View>
        )}

        {/* Locked Message */}
        {!hasPredicted && isPredictionLocked && (
          <View style={styles.lockedCard}>
            <Ionicons name="lock-closed" size={32} color="#f59e0b" />
            <Text style={styles.lockedTitle}>Predictions Locked</Text>
            <Text style={styles.lockedText}>This match has already started</Text>
          </View>
        )}

        {/* User's Prediction */}
        {hasPredicted && (
          <View style={[
            styles.myPredictionCard,
            predictionStatus?.color && { borderColor: predictionStatus.color }
          ]}>
            <View style={styles.myPredictionHeader}>
              <View style={styles.myPredictionTitleRow}>
                <Ionicons name="bookmark" size={20} color="#6366f1" />
                <Text style={styles.sectionTitle}>Your Prediction</Text>
              </View>
              {predictionStatus && (
                <View style={[styles.resultBadge, { backgroundColor: predictionStatus.color }]}>
                  <Ionicons name={predictionStatus.icon as any} size={14} color="#fff" />
                  <Text style={styles.resultBadgeText}>{predictionStatus.label}</Text>
                </View>
              )}
            </View>

            <View style={styles.myPredictionContent}>
              <View style={styles.predictionTeamInfo}>
                <View style={styles.predictionLogoContainer}>
                  <Image source={myPrediction.team.logoUrl} style={styles.predictionLogo} contentFit="contain" />
                </View>
                <View>
                  <Text style={styles.predictionTeamTag}>{myPrediction.team.tag}</Text>
                  <Text style={styles.predictionLabel}>Winner</Text>
                </View>
              </View>

              <View style={styles.predictionScoreBox}>
                <Text style={styles.predictionScoreLabel}>Score</Text>
                <Text style={styles.predictionScoreValue}>
                  {myPrediction.predictedTeamAScore} - {myPrediction.predictedTeamBScore}
                </Text>
              </View>

              {myPrediction.points !== null && (
                <View style={styles.pointsBox}>
                  <Text style={styles.pointsLabel}>Points</Text>
                  <Text style={[styles.pointsValue, { color: predictionStatus?.color || "#6366f1" }]}>
                    +{myPrediction.points}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* All Predictions */}
        {hasPredicted && allPredictions && allPredictions.length > 0 && (
          <View style={styles.allPredictionsCard}>
            <View style={styles.allPredictionsHeader}>
              <Ionicons name="people" size={20} color="#6c757d" />
              <Text style={styles.sectionTitle}>Community Predictions</Text>
              <View style={styles.predictionCountBadge}>
                <Text style={styles.predictionCountText}>{allPredictions.length}</Text>
              </View>
            </View>

            <View style={styles.predictionsList}>
              {allPredictions.map((prediction, index) => (
                <View
                  key={prediction.id}
                  style={[
                    styles.predictionListItem,
                    index === allPredictions.length - 1 && styles.predictionListItemLast
                  ]}
                >
                  <View style={styles.predictionUserInfo}>
                    {prediction.user?.image ? (
                      <Image source={prediction.user.image} style={styles.userAvatar} />
                    ) : (
                      <View style={styles.userAvatarPlaceholder}>
                        <Text style={styles.avatarInitial}>
                          {(prediction.user?.displayUsername || prediction.user?.username || "?")[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.userName} numberOfLines={1}>
                      {prediction.user?.displayUsername || prediction.user?.username || prediction.user?.name || "Anonymous"}
                    </Text>
                  </View>

                  <View style={styles.predictionValue}>
                    <View style={styles.miniLogoContainer}>
                      <Image source={prediction.team.logoUrl} style={styles.miniLogo} contentFit="contain" />
                    </View>
                    <Text style={styles.predictionValueScore}>
                      {prediction.predictedTeamAScore}-{prediction.predictedTeamBScore}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty Predictions State */}
        {hasPredicted && (!allPredictions || allPredictions.length === 0) && (
          <View style={styles.emptyPredictions}>
            <Ionicons name="people-outline" size={40} color="#adb5bd" />
            <Text style={styles.emptyPredictionsText}>Be the first to predict!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6c757d",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },

  // Match Card
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusBadgeContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  statusUpcoming: {
    backgroundColor: "#6366f1",
  },
  statusLive: {
    backgroundColor: "#ef4444",
  },
  statusCompleted: {
    backgroundColor: "#10b981",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },

  // Teams
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e9ecef",
    backgroundColor: "#fff",
    position: "relative",
  },
  teamCardSelected: {
    borderColor: "#6366f1",
    backgroundColor: "#eef2ff",
  },
  teamCardPredicted: {
    borderColor: "#10b981",
    backgroundColor: "#ecfdf5",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  teamLogoContainer: {
    width: 56,
    height: 56,
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  teamLogo: {
    width: 40,
    height: 40,
  },
  teamTag: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginTop: 8,
  },
  teamName: {
    fontSize: 11,
    color: "#6c757d",
    marginTop: 2,
    maxWidth: 80,
    textAlign: "center",
  },

  // Score
  matchScoreContainer: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  scoreBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#adb5bd",
  },
  scoreWinner: {
    color: "#1a1a2e",
  },
  scoreDivider: {
    fontSize: 28,
    fontWeight: "800",
    color: "#adb5bd",
    marginHorizontal: 6,
  },
  vsBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  vsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#adb5bd",
  },
  bestOfBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6c757d",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },

  // Match Date
  matchDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  matchDateText: {
    fontSize: 13,
    color: "#6c757d",
  },

  // Score Selection
  scoreSelectionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreSelectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  selectedTeamBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  miniLogo: {
    width: 18,
    height: 18,
  },
  selectedTeamText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366f1",
  },
  scoresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  scorePill: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  scorePillSelected: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  scorePillText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  scorePillTextSelected: {
    color: "#fff",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6366f1",
    paddingVertical: 14,
    borderRadius: 14,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 10,
  },
  errorMessage: {
    color: "#dc3545",
    fontSize: 13,
    flex: 1,
  },

  // Prompt Card
  promptCard: {
    backgroundColor: "#eef2ff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#c7d2fe",
    borderStyle: "dashed",
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginTop: 12,
  },
  promptText: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: 4,
  },

  // Locked Card
  lockedCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  lockedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400e",
    marginTop: 12,
  },
  lockedText: {
    fontSize: 13,
    color: "#a16207",
    marginTop: 4,
  },

  // My Prediction Card
  myPredictionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#10b981",
  },
  myPredictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  myPredictionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  myPredictionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  predictionTeamInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  predictionLogoContainer: {
    width: 44,
    height: 44,
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  predictionLogo: {
    width: 32,
    height: 32,
  },
  predictionTeamTag: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  predictionLabel: {
    fontSize: 11,
    color: "#6c757d",
  },
  predictionScoreBox: {
    alignItems: "center",
  },
  predictionScoreLabel: {
    fontSize: 11,
    color: "#6c757d",
  },
  predictionScoreValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  pointsBox: {
    alignItems: "center",
  },
  pointsLabel: {
    fontSize: 11,
    color: "#6c757d",
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: "700",
  },

  // All Predictions
  allPredictionsCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  allPredictionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  predictionCountBadge: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: "auto",
  },
  predictionCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6c757d",
  },
  predictionsList: {
    gap: 0,
  },
  predictionListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  predictionListItemLast: {
    borderBottomWidth: 0,
  },
  predictionUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  userName: {
    fontSize: 14,
    color: "#1a1a2e",
    fontWeight: "500",
    flex: 1,
  },
  predictionValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniLogoContainer: {
    width: 24,
    height: 24,
    backgroundColor: "#1a1a2e",
    borderRadius: 6,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  predictionValueScore: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  // Empty State
  emptyPredictions: {
    alignItems: "center",
    padding: 32,
  },
  emptyPredictionsText: {
    fontSize: 14,
    color: "#adb5bd",
    marginTop: 8,
  },

  // Error
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    marginTop: 12,
    fontWeight: "500",
  },
  errorButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#6366f1",
    borderRadius: 10,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
