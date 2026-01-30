import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native"

interface ButtonProps extends TouchableOpacityProps {
  title: string
  variant?: "primary" | "secondary" | "discord"
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

  const textStyle = [
    styles.buttonText,
    variant === "secondary" && styles.secondaryButtonText,
  ]

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" ? "#007AFF" : "#fff"}
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  discordButton: {
    backgroundColor: "#5865F2",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#007AFF",
  },
})
