import { View, StyleSheet } from "react-native"
import { colors, spacing } from "./theme"
import { Typography } from "./Typography"

type DayHeaderProps = {
  date: Date
  isToday?: boolean
}

function formatDayHeader(date: Date, isToday: boolean): string {
  if (isToday) {
    return "Today"
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow"
  }

  // Format: "Friday, January 30"
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export default function DayHeader({ date, isToday = false }: DayHeaderProps) {
  const today = new Date()
  const isTodayActual = date.toDateString() === today.toDateString()

  return (
    <View style={[styles.container, isTodayActual && styles.todayContainer]}>
      <View style={styles.line} />
      <View style={[styles.badge, isTodayActual && styles.todayBadge]}>
        <Typography
          variant="label"
          weight="bold"
          color={isTodayActual ? "primary" : "secondary"}
          uppercase
        >
          {formatDayHeader(date, isTodayActual)}
        </Typography>
      </View>
      <View style={styles.line} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  todayContainer: {
    backgroundColor: colors.backgroundSecondary,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  badge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    marginHorizontal: spacing.sm,
  },
  todayBadge: {
    backgroundColor: colors.primaryLight,
  },
})
