import { View, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, borderRadius } from "../ui/theme"
import { Typography, Small } from "../ui/Typography"

type HeaderProps = {
  leagueName: string
  tournamentName: string
  onBack: () => void
}

export function MatchHeader({
  leagueName,
  tournamentName,
  onBack,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Typography variant="subtitle" weight="bold">
          {leagueName}
        </Typography>
        <Small>{tournamentName}</Small>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  )
}

const styles = StyleSheet.create({
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
    borderRadius: borderRadius.round,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
})
