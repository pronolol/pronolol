import type { ReactNode } from "react"
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native"
import { colors, borderRadius, spacing, shadow } from "./theme"

type CardVariant =
  | "default"
  | "elevated"
  | "outlined"
  | "success"
  | "warning"
  | "error"

type CardProps = {
  children: ReactNode
  variant?: CardVariant
  style?: StyleProp<ViewStyle>
  padding?: keyof typeof spacing | number
}

export function Card({
  children,
  variant = "default",
  style,
  padding = "xl",
}: CardProps) {
  const paddingValue = typeof padding === "number" ? padding : spacing[padding]

  return (
    <View
      style={[
        styles.base,
        variant === "elevated" && styles.elevated,
        variant === "outlined" && styles.outlined,
        variant === "success" && styles.success,
        variant === "warning" && styles.warning,
        variant === "error" && styles.error,
        { padding: paddingValue },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    ...shadow.md,
  },
  elevated: {
    ...shadow.lg,
  },
  outlined: {
    ...shadow.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  success: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  error: {
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error,
  },
})
