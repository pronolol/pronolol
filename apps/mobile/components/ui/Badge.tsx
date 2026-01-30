import { View, StyleSheet, ViewStyle, StyleProp } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, borderRadius, spacing } from "./theme"
import { Typography } from "./Typography"

type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "neutral"
  | "live"

type BadgeProps = {
  label: string
  variant?: BadgeVariant
  icon?: keyof typeof Ionicons.glyphMap
  size?: "sm" | "md"
  style?: StyleProp<ViewStyle>
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: colors.primary, text: colors.textInverse },
  success: { bg: colors.success, text: colors.textInverse },
  warning: { bg: colors.warning, text: colors.textInverse },
  error: { bg: colors.error, text: colors.textInverse },
  neutral: { bg: colors.surfaceSecondary, text: colors.textSecondary },
  live: { bg: colors.live, text: colors.textInverse },
}

export function Badge({
  label,
  variant = "neutral",
  icon,
  size = "md",
  style,
}: BadgeProps) {
  const { bg, text } = variantColors[variant]
  const isSmall = size === "sm"

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        isSmall && styles.badgeSm,
        style,
      ]}
    >
      {variant === "live" && <View style={styles.liveDot} />}
      {icon && <Ionicons name={icon} size={isSmall ? 12 : 14} color={text} />}
      <Typography variant={isSmall ? "small" : "label"} style={{ color: text }}>
        {label}
      </Typography>
    </View>
  )
}

type StatusBadgeVariant = "upcoming" | "live" | "completed"

type StatusBadgeProps = {
  status: StatusBadgeVariant
  style?: StyleProp<ViewStyle>
}

const statusConfig: Record<
  StatusBadgeVariant,
  {
    label: string
    variant: BadgeVariant
    icon?: keyof typeof Ionicons.glyphMap
  }
> = {
  upcoming: { label: "Upcoming", variant: "primary", icon: "time-outline" },
  live: { label: "In Progress", variant: "live" },
  completed: {
    label: "Completed",
    variant: "success",
    icon: "checkmark-circle",
  },
}

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge
      label={config.label}
      variant={config.variant}
      icon={config.icon}
      style={style}
    />
  )
}

type CountBadgeProps = {
  count: number
  style?: StyleProp<ViewStyle>
}

export function CountBadge({ count, style }: CountBadgeProps) {
  return (
    <View style={[styles.countBadge, style]}>
      <Typography variant="label" color="secondary">
        {count}
      </Typography>
    </View>
  )
}

type ResultBadgeVariant = "exact" | "correct" | "wrong"

type ResultBadgeProps = {
  result: ResultBadgeVariant
  style?: StyleProp<ViewStyle>
}

const resultConfig: Record<
  ResultBadgeVariant,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  exact: { label: "Exact!", icon: "trophy", color: colors.success },
  correct: {
    label: "Correct",
    icon: "checkmark-circle",
    color: colors.primary,
  },
  wrong: { label: "Wrong", icon: "close-circle", color: colors.error },
}

export function ResultBadge({ result, style }: ResultBadgeProps) {
  const config = resultConfig[result]
  return (
    <View
      style={[styles.resultBadge, { backgroundColor: config.color }, style]}
    >
      <Ionicons name={config.icon} size={14} color={colors.textInverse} />
      <Typography variant="label" color="inverse">
        {config.label}
      </Typography>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
  },
  badgeSm: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textInverse,
  },
  countBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.round,
  },
})
