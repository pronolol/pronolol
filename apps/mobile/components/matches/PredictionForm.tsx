import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native"
import { Image } from "expo-image"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, borderRadius } from "../ui/theme"
import { Typography, Caption } from "../ui/Typography"
import { Card } from "../ui/Card"
import type { Team } from "@/api/generated/models"

type ScoreOption = {
  teamA: number
  teamB: number
}

type ScoreSelectionCardProps = {
  selectedTeam: Team
  possibleScores: ScoreOption[]
  selectedScore: ScoreOption | null
  onSelectScore: (score: ScoreOption) => void
  onSubmit: () => void
  isSubmitting: boolean
  error?: string | null
}

export function ScoreSelectionCard({
  selectedTeam,
  possibleScores,
  selectedScore,
  onSelectScore,
  onSubmit,
  isSubmitting,
  error,
}: ScoreSelectionCardProps) {
  return (
    <Card>
      <View style={styles.scoreSelectionHeader}>
        <Typography variant="subtitle" weight="bold">
          Predict the Score
        </Typography>
        <View style={styles.selectedTeamBadge}>
          <Image
            source={selectedTeam.logoUrl}
            style={styles.miniLogo}
            contentFit="contain"
          />
          <Typography
            variant="label"
            color="primary"
            style={styles.selectedTeamText}
          >
            {selectedTeam.tag} wins
          </Typography>
        </View>
      </View>

      <View style={styles.scoresGrid}>
        {possibleScores.map((score, index) => {
          const isSelected =
            selectedScore?.teamA === score.teamA &&
            selectedScore?.teamB === score.teamB
          return (
            <TouchableOpacity
              key={index}
              style={[styles.scorePill, isSelected && styles.scorePillSelected]}
              onPress={() => onSelectScore(score)}
            >
              <Typography
                variant="subtitle"
                style={[
                  styles.scorePillText,
                  isSelected && styles.scorePillTextSelected,
                ]}
              >
                {score.teamA} - {score.teamB}
              </Typography>
            </TouchableOpacity>
          )
        })}
      </View>

      {selectedScore && (
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textInverse} size="small" />
          ) : (
            <>
              <Ionicons name="send" size={18} color={colors.textInverse} />
              <Typography variant="subtitle" color="inverse">
                Submit Prediction
              </Typography>
            </>
          )}
        </TouchableOpacity>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={18} color={colors.error} />
          <Caption color="error" style={styles.errorMessage}>
            {error}
          </Caption>
        </View>
      )}
    </Card>
  )
}

type PromptCardProps = {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  message: string
  variant?: "default" | "warning"
}

export function PromptCard({
  icon,
  title,
  message,
  variant = "default",
}: PromptCardProps) {
  const isWarning = variant === "warning"

  return (
    <Card variant={isWarning ? "warning" : "default"} style={styles.promptCard}>
      <Ionicons
        name={icon}
        size={32}
        color={isWarning ? colors.warning : colors.primary}
      />
      <Typography
        variant="subtitle"
        weight="bold"
        color={isWarning ? "warning" : "primary"}
        style={styles.promptTitle}
      >
        {title}
      </Typography>
      <Caption color={isWarning ? "warning" : "secondary"}>{message}</Caption>
    </Card>
  )
}

const styles = StyleSheet.create({
  scoreSelectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  selectedTeamBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
  },
  miniLogo: {
    width: 18,
    height: 18,
  },
  selectedTeamText: {
    color: colors.primary,
  },
  scoresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  scorePill: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  scorePillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scorePillText: {
    color: colors.textPrimary,
  },
  scorePillTextSelected: {
    color: colors.textInverse,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.md,
  },
  errorMessage: {
    flex: 1,
  },
  promptCard: {
    alignItems: "center",
  },
  promptTitle: {
    marginTop: spacing.md,
  },
})
