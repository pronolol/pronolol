import { View, StyleSheet } from "react-native"
import { Image } from "expo-image"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, borderRadius } from "../ui/theme"
import { Typography, Small } from "../ui/Typography"
import { Card } from "../ui/Card"
import { ResultBadge } from "../ui/Badge"
import type { Team } from "@/api/generated/models"

type Prediction = {
  id: string
  teamId: string
  predictedTeamAScore: number
  predictedTeamBScore: number
  points: number | null
  isCorrect: boolean | null
  isExact: boolean | null
  team: Team
}

type MyPredictionCardProps = {
  prediction: Prediction
  isMatchCompleted: boolean
}

export function MyPredictionCard({
  prediction,
  isMatchCompleted,
}: MyPredictionCardProps) {
  const getResult = (): "exact" | "correct" | "wrong" | null => {
    if (!isMatchCompleted) return null
    if (prediction.isExact) return "exact"
    if (prediction.isCorrect) return "correct"
    return "wrong"
  }

  const result = getResult()
  const resultColors = {
    exact: colors.success,
    correct: colors.primary,
    wrong: colors.error,
  }

  return (
    <Card
      variant="success"
      style={[
        styles.myPredictionCard,
        result && { borderColor: resultColors[result] },
      ]}
    >
      <View style={styles.myPredictionHeader}>
        <View style={styles.myPredictionTitleRow}>
          <Ionicons name="bookmark" size={20} color={colors.primary} />
          <Typography variant="subtitle" weight="bold">
            Your Prediction
          </Typography>
        </View>
        {result && <ResultBadge result={result} />}
      </View>

      <View style={styles.myPredictionContent}>
        <View style={styles.predictionTeamInfo}>
          <View style={styles.predictionLogoContainer}>
            <Image
              source={prediction.team.logoUrl}
              style={styles.predictionLogo}
              contentFit="contain"
            />
          </View>
          <View>
            <Typography variant="subtitle" weight="bold">
              {prediction.team.tag}
            </Typography>
            <Small>Winner</Small>
          </View>
        </View>

        <View style={styles.predictionScoreBox}>
          <Small>Score</Small>
          <Typography variant="title" weight="bold">
            {prediction.predictedTeamAScore} - {prediction.predictedTeamBScore}
          </Typography>
        </View>

        {prediction.points !== null && (
          <View style={styles.pointsBox}>
            <Small>Points</Small>
            <Typography
              variant="title"
              weight="bold"
              style={{ color: result ? resultColors[result] : colors.primary }}
            >
              +{prediction.points}
            </Typography>
          </View>
        )}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  myPredictionCard: {
    borderWidth: 2,
  },
  myPredictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  myPredictionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  myPredictionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  predictionTeamInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    flex: 1,
  },
  predictionLogoContainer: {
    width: 44,
    height: 44,
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.md,
    padding: spacing.xs + 2,
    justifyContent: "center",
    alignItems: "center",
  },
  predictionLogo: {
    width: 32,
    height: 32,
  },
  predictionScoreBox: {
    alignItems: "center",
  },
  pointsBox: {
    alignItems: "center",
  },
})
