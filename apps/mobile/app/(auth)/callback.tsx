import { useEffect, useState } from "react"
import { View, ActivityIndicator, StyleSheet, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import { useSession } from "@/lib/auth-client"

export default function AuthCallbackScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { data: session, refetch, isPending } = useSession()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a moment for the OAuth redirect to complete
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Refetch the session to get the latest auth state
        await refetch()

        // Wait a bit more to ensure session is persisted
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Navigate to home
        router.replace("/")
      } catch (error) {
        console.error("Callback error:", error)
        // On error, redirect to sign in
        router.replace("/(auth)/sign-in")
      } finally {
        setIsProcessing(false)
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
