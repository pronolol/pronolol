import { useEffect } from "react"
import { ActivityIndicator, StyleSheet, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useSession } from "@/lib/auth-client"


export default function AuthCallbackScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { refetch } = useSession()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Callback: Starting OAuth callback handling")
        console.log("Callback: URL params", params)

        // Wait a moment for the OAuth redirect to complete
        await new Promise((resolve) => setTimeout(resolve, 500))

        console.log("Callback: Refetching session...")
        // Refetch the session to get the latest auth state
        const result = await refetch()
        console.log("Callback: Session refetch result", result)

        // Wait a bit more to ensure session is persisted
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Navigate to home
        console.log("Callback: Navigating to home")
        router.replace("/")
      } catch (error) {
        console.error("Callback error:", error)
        // On error, redirect to sign in
        router.replace("/(auth)/sign-in")
      }
    }

    handleCallback()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Completing sign in...</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
})
