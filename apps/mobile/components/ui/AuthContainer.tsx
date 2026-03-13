import type { ReactNode } from "react"
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import type { Href } from "expo-router"
import { colors, spacing, borderRadius, shadow } from "./theme"
import { Typography } from "./Typography"

type AuthContainerProps = {
  title: string
  subtitle: string
  children: ReactNode
  footerText?: string
  footerLinkText?: string
  footerLinkTo?: string
}

export default function AuthContainer({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthContainerProps) {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Typography variant="display">{title}</Typography>
            <Typography
              variant="body"
              color="secondary"
              style={styles.subtitle}
            >
              {subtitle}
            </Typography>

            {children}

            {footerText && footerLinkText && footerLinkTo && (
              <View style={styles.footer}>
                <Typography variant="body" color="secondary">
                  {footerText}{" "}
                </Typography>
                <TouchableOpacity
                  onPress={() => router.push(footerLinkTo as Href)}
                >
                  <Typography
                    variant="body"
                    weight="semibold"
                    style={styles.link}
                  >
                    {footerLinkText}
                  </Typography>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    ...shadow.md,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xxl,
  },
  link: {
    color: colors.secondary,
  },
})
