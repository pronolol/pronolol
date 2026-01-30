import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native"
import { colors, spacing, borderRadius } from "./theme"
import { Typography } from "./Typography"

type ButtonVariant = "primary" | "secondary" | "discord"

type ButtonProps = TouchableOpacityProps & {
  title: string
  variant?: ButtonVariant
  loading?: boolean
}

export default function Button({
  title,
  variant = "primary",
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const buttonStyle = [
    styles.button,
    variant === "secondary" && styles.secondaryButton,
    variant === "discord" && styles.discordButton,
    (disabled || loading) && styles.buttonDisabled,
    style,
  ]

  const textColor = variant === "secondary" ? "primary" : "inverse"

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "secondary" ? colors.secondary : colors.textInverse
          }
        />
      ) : (
        <Typography variant="subtitle" color={textColor as any}>
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  discordButton: {
    backgroundColor: colors.discord,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
