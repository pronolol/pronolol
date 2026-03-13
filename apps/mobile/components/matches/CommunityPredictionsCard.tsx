import { View, StyleSheet } from "react-native"
import { Image } from "expo-image"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, borderRadius } from "../ui/theme"
import { Typography, Small } from "../ui/Typography"
import { Card } from "../ui/Card"
import { CountBadge } from "../ui/Badge"
import { Avatar } from "../ui/Avatar"
import type { Team } from "@/api/generated/models"

type User = {
  name?: string | null
  username?: string | null
  displayUsername?: string | null
  image?: string | null
}

type Prediction = {
  id: string
  teamId: string
  predictedTeamAScore: number
  predictedTeamBScore: number
  points: number | null
  isCorrect: boolean | null
  isExact: boolean | null
  team: Team
  user?: User
}

type CommunityPredictionsCardProps = {
  predictions: Prediction[]
  isMatchCompleted: boolean
}

export function CommunityPredictionsCard({
  predictions,
  isMatchCompleted,
}: CommunityPredictionsCardProps) {
  const exactCount = predictions.filter((p) => p.isExact === true).length
  const correctCount = predictions.filter(
    (p) => p.isCorrect === true && p.isExact !== true
  ).length
  const wrongCount = predictions.filter((p) => p.isCorrect === false).length

  return (
    <Card padding={0}>
      <View style={styles.header}>
        <Ionicons name="people" size={20} color={colors.textSecondary} />
        <Typography variant="subtitle" weight="bold">
          Community Predictions
        </Typography>
        <CountBadge count={predictions.length} style={styles.countBadge} />
      </View>

      {isMatchCompleted && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={16} color={colors.success} />
            <Small>{exactCount} Exact</Small>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.primary}
            />
            <Small>{correctCount} Correct</Small>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="close-circle" size={16} color={colors.error} />
            <Small>{wrongCount} Wrong</Small>
          </View>
        </View>
      )}

      <View style={styles.predictionsList}>
        {predictions.map((prediction, index) => (
          <PredictionListItem
            key={prediction.id}
            prediction={prediction}
            isMatchCompleted={isMatchCompleted}
            isLast={index === predictions.length - 1}
          />
        ))}
      </View>
    </Card>
  )
}

type PredictionListItemProps = {
  prediction: Prediction
  isMatchCompleted: boolean
  isLast: boolean
}

function PredictionListItem({
  prediction,
  isMatchCompleted,
  isLast,
}: PredictionListItemProps) {
  const getResultStyle = () => {
    if (!isMatchCompleted || prediction.points === null) return null
    if (prediction.isExact)
      return { icon: "trophy", color: colors.success, bg: colors.successLight }
    if (prediction.isCorrect)
      return {
        icon: "checkmark-circle",
        color: colors.primary,
        bg: colors.primaryLight,
      }
    return { icon: "close-circle", color: colors.error, bg: colors.errorLight }
  }

  const resultStyle = getResultStyle()
  const userName =
    prediction.user?.displayUsername ||
    prediction.user?.username ||
    prediction.user?.name ||
    "Anonymous"

  return (
    <View
      style={[
        styles.predictionListItemWrapper,
        isLast && styles.predictionListItemWrapperLast,
      ]}
    >
      <View
        style={[
          styles.predictionListItem,
          resultStyle && styles.predictionListItemWithResult,
          resultStyle && { backgroundColor: resultStyle.bg },
        ]}
      >
        <View style={styles.predictionUserInfo}>
          <Avatar source={prediction.user?.image} name={userName} size="md" />
          <View style={styles.userNameContainer}>
            <Typography variant="body" weight="medium" numberOfLines={1}>
              {userName}
            </Typography>
            {isMatchCompleted && prediction.points !== null && (
              <Small style={{ color: resultStyle?.color }}>
                +{prediction.points} pts
              </Small>
            )}
          </View>
        </View>

        <View style={styles.predictionValue}>
          <View style={styles.miniLogoContainer}>
            <Image
              source={prediction.team.logoUrl}
              style={styles.miniLogo}
              contentFit="contain"
            />
          </View>
          <View style={styles.scoreChip}>
            <Typography variant="body" weight="semibold" color="secondary">
              {prediction.predictedTeamAScore}-{prediction.predictedTeamBScore}
            </Typography>
          </View>
          {resultStyle && (
            <View
              style={[
                styles.resultIconBadge,
                { backgroundColor: resultStyle.bg },
              ]}
            >
              <Ionicons
                name={resultStyle.icon}
                size={16}
                color={resultStyle.color}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  countBadge: {
    marginLeft: "auto",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  predictionsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  predictionListItemWrapper: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  predictionListItemWrapperLast: {
    // No special styling needed for last item now
  },
  predictionListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  predictionListItemWithResult: {
    // Background color applied dynamically
  },
  predictionUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    flex: 1,
  },
  userNameContainer: {
    flex: 1,
  },
  predictionValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  miniLogoContainer: {
    width: 24,
    height: 24,
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.xs + 2,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  miniLogo: {
    width: 18,
    height: 18,
  },
  scoreChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  resultIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
})
