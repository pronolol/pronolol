import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, borderRadius } from "./theme"
import { Typography } from "./Typography"

type LoadingScreenProps = {
  message?: string
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Typography
        variant="caption"
        color="secondary"
        style={styles.loadingText}
      >
        {message}
      </Typography>
    </SafeAreaView>
  )
}

type ErrorScreenProps = {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorScreen({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
}: ErrorScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
      <Typography variant="title" color="error" style={styles.errorTitle}>
        {title}
      </Typography>
      {message && (
        <Typography
          variant="body"
          color="secondary"
          center
          style={styles.errorMessage}
        >
          {message}
        </Typography>
      )}
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Typography variant="subtitle" color="inverse">
            {retryLabel}
          </Typography>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap
  title: string
  message?: string
  action?: {
    label: string
    onPress: () => void
  }
}

export function EmptyState({
  icon = "document-outline",
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Typography variant="title" color="secondary" style={styles.emptyTitle}>
        {title}
      </Typography>
      {message && (
        <Typography variant="body" color="muted" center>
          {message}
        </Typography>
      )}
      {action && (
        <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
          <Typography variant="subtitle" color="inverse">
            {action.label}
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorTitle: {
    marginTop: spacing.md,
  },
  errorMessage: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyContainer: {
    alignItems: "center",
    padding: spacing.xxxl,
  },
  emptyTitle: {
    marginTop: spacing.md,
  },
  actionButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
})
