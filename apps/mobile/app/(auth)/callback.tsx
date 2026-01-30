import { useEffect } from "react"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import { useSession } from "@/lib/auth-client"

export default function AuthCallbackScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { data: session, refetch } = useSession()

  useEffect(() => {
    const handleCallback = async () => {
      await refetch()

      setTimeout(() => {
        router.replace("/")
      }, 300)
    }

    handleCallback()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
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
})
