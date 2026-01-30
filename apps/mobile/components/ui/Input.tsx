import { View, TextInput, StyleSheet, TextInputProps } from "react-native"
import {
  colors,
  spacing,
  borderRadius,
  fontSize as themeFontSize,
} from "./theme"
import { Typography, Small } from "./Typography"

type InputProps = TextInputProps & {
  label: string
  error?: string
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      <Typography variant="label" style={styles.label}>
        {label}
      </Typography>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error && (
        <Small color="error" style={styles.error}>
          {error}
        </Small>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  label: {
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontSize: themeFontSize.xl,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    marginTop: spacing.xs,
  },
})
