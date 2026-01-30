import {
  StyleSheet,
  View,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from "react-native"
import { Image } from "expo-image"
import { colors, spacing, borderRadius, shadow } from "./ui/theme"
import { Typography, Label, Small } from "./ui/Typography"

type Team = {
  name: string
  logoUrl: string
}

type MatchScore = {
  teamA: number
  teamB: number
}

type MatchCardProps = {
  teamA: Team
  teamB: Team
  matchTime?: string
  league?: string
  score?: MatchScore
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

function TeamDisplay({ team }: { team: Team }) {
  return (
    <View style={styles.teamContainer}>
      <View style={styles.logoWrapper}>
        <Image
          style={styles.teamLogo}
          source={team.logoUrl}
          contentFit="contain"
        />
      </View>
      <Typography variant="subtitle" weight="bold" center numberOfLines={1}>
        {team.name}
      </Typography>
    </View>
  )
}

type MatchCenterProps = {
  score?: MatchScore
  matchTime?: string
}

function MatchCenter({ score, matchTime }: MatchCenterProps) {
  return (
    <View style={styles.vsContainer}>
      {score ? (
        <>
          <Typography variant="title" weight="bold" style={styles.scoreText}>
            {score.teamA} - {score.teamB}
          </Typography>
          {matchTime && <Small style={styles.timeText}>{matchTime}</Small>}
        </>
      ) : (
        <>
          <Label color="muted" weight="extrabold" uppercase>
            VS
          </Label>
          {matchTime && <Small style={styles.timeText}>{matchTime}</Small>}
        </>
      )}
    </View>
  )
}

export default function MatchCard({
  teamA,
  teamB,
  matchTime,
  league,
  score,
  onPress,
  style,
}: MatchCardProps) {
  const CardContent = (
    <>
      {league && (
        <View style={styles.leagueHeader}>
          <Label color="secondary" uppercase>
            {league}
          </Label>
        </View>
      )}

      <View style={styles.matchContent}>
        <TeamDisplay team={teamA} />
        <MatchCenter score={score} matchTime={matchTime} />
        <TeamDisplay team={teamB} />
      </View>
    </>
  )

  const cardStyle = [styles.card, style]

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    )
  }

  return <View style={cardStyle}>{CardContent}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadow.md,
  },
  leagueHeader: {
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  matchContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  teamContainer: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  teamLogo: {
    width: "100%",
    height: "100%",
  },
  vsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  scoreText: {
    fontSize: 24,
  },
  timeText: {
    marginTop: spacing.xs,
  },
})
