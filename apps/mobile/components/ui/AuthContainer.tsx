import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"

interface AuthContainerProps {
  title: string
  subtitle: string
  children: React.ReactNode
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
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            {children}

            {footerText && footerLinkText && footerLinkTo && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>{footerText} </Text>
                <TouchableOpacity
                  onPress={() => router.push(footerLinkTo as any)}
                >
                  <Text style={styles.link}>{footerLinkText}</Text>
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
    backgroundColor: "#f5f5f5",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  link: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
})
