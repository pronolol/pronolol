import { View, StyleSheet, TouchableOpacity } from "react-native"
import { Image } from "expo-image"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, borderRadius } from "../ui/theme"
import { Typography, Small, Caption } from "../ui/Typography"
import { StatusBadge } from "../ui/Badge"
import type { Team } from "@/api/generated/models"

type TeamCardProps = {
  team: Team
  isSelected: boolean
  isPredicted: boolean
  disabled: boolean
  onPress: () => void
}

function TeamCard({
  team,
  isSelected,
  isPredicted,
  disabled,
  onPress,
}: TeamCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.teamCard,
        isSelected && styles.teamCardSelected,
        isPredicted && styles.teamCardPredicted,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {isSelected && !isPredicted && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={14} color={colors.textInverse} />
        </View>
      )}
      <View style={styles.teamLogoContainer}>
        <Image
          source={team.logoUrl}
          style={styles.teamLogo}
          contentFit="contain"
        />
      </View>
      <Typography variant="subtitle" weight="bold" style={styles.teamTag}>
        {team.tag}
      </Typography>
      <Small numberOfLines={1} center style={styles.teamName}>
        {team.name}
      </Small>
    </TouchableOpacity>
  )
}

type ScoreDisplayProps = {
  teamAScore: number | null
  teamBScore: number | null
  bestOf: number
}

function ScoreDisplay({ teamAScore, teamBScore, bestOf }: ScoreDisplayProps) {
  const hasScore = teamAScore !== null && teamBScore !== null

  return (
    <View style={styles.matchScoreContainer}>
      {hasScore ? (
        <View style={styles.scoreBox}>
          <Typography
            variant="title"
            weight="extrabold"
            style={[
              styles.scoreNumber,
              teamAScore! > teamBScore! && styles.scoreWinner,
            ]}
          >
            {teamAScore}
          </Typography>
          <Typography
            variant="title"
            weight="extrabold"
            color="muted"
            style={styles.scoreDivider}
          >
            :
          </Typography>
          <Typography
            variant="title"
            weight="extrabold"
            style={[
              styles.scoreNumber,
              teamBScore! > teamAScore! && styles.scoreWinner,
            ]}
          >
            {teamBScore}
          </Typography>
        </View>
      ) : (
        <View style={styles.vsBox}>
          <Typography variant="subtitle" weight="bold" color="muted">
            VS
          </Typography>
        </View>
      )}
      <View style={styles.bestOfBadge}>
        <Small>BO{bestOf}</Small>
      </View>
    </View>
  )
}

type MatchDetailCardProps = {
  teamA: Team
  teamB: Team
  teamAScore: number | null
  teamBScore: number | null
  bestOf: number
  matchDate: string | null
  state: string
  isPredictionLocked: boolean
  hasPredicted: boolean
  selectedTeamId: string | null
  predictedTeamId?: string
  onTeamSelect: (teamId: string) => void
}

export function MatchDetailCard({
  teamA,
  teamB,
  teamAScore,
  teamBScore,
  bestOf,
  matchDate,
  state,
  isPredictionLocked,
  hasPredicted,
  selectedTeamId,
  predictedTeamId,
  onTeamSelect,
}: MatchDetailCardProps) {
  const isMatchCompleted = state === "completed"
  const matchStatus = isMatchCompleted
    ? "completed"
    : isPredictionLocked
      ? "live"
      : "upcoming"

  return (
    <View style={styles.matchCard}>
      <View style={styles.statusBadgeContainer}>
        <StatusBadge status={matchStatus} />
      </View>

      <View style={styles.teamsContainer}>
        <TeamCard
          team={teamA}
          isSelected={
            !hasPredicted && !isPredictionLocked && selectedTeamId === teamA.id
          }
          isPredicted={hasPredicted && predictedTeamId === teamA.id}
          disabled={hasPredicted || isPredictionLocked}
          onPress={() => onTeamSelect(teamA.id)}
        />

        <ScoreDisplay
          teamAScore={teamAScore}
          teamBScore={teamBScore}
          bestOf={bestOf}
        />

        <TeamCard
          team={teamB}
          isSelected={
            !hasPredicted && !isPredictionLocked && selectedTeamId === teamB.id
          }
          isPredicted={hasPredicted && predictedTeamId === teamB.id}
          disabled={hasPredicted || isPredictionLocked}
          onPress={() => onTeamSelect(teamB.id)}
        />
      </View>

      {matchDate && (
        <View style={styles.matchDateContainer}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Caption>
            {new Date(matchDate).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Caption>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  matchCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusBadgeContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    position: "relative",
  },
  teamCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  teamCardPredicted: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  checkBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  teamLogoContainer: {
    width: 56,
    height: 56,
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  teamLogo: {
    width: 40,
    height: 40,
  },
  teamTag: {
    marginTop: spacing.sm,
  },
  teamName: {
    marginTop: spacing.xs,
    maxWidth: 80,
  },
  matchScoreContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  scoreBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreNumber: {
    fontSize: 28,
    color: colors.textMuted,
  },
  scoreWinner: {
    color: colors.textPrimary,
  },
  scoreDivider: {
    fontSize: 28,
    marginHorizontal: spacing.xs + 2,
  },
  vsBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  bestOfBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  matchDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
})
