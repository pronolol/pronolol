import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import * as SecureStore from "expo-secure-store"
import { API_BASE_URL } from "@/config/env"

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  basePath: "/auth",
  plugins: [
    expoClient({
      scheme: "pronolol",
      storagePrefix: "pronolol",
      storage: SecureStore,
    }),
  ],
  fetchOptions: {
    credentials: "include",
    onError(context) {
      console.error("Auth error:", context.error)
    },
  },
})

export const { signIn, signUp, useSession, $fetch } = authClient

// Enhanced signOut function that properly clears all stored data
export const signOut = async () => {
  try {
    // Call the server signOut endpoint
    await authClient.signOut()

    // Clear all stored authentication data
    await SecureStore.deleteItemAsync("pronolol.session.token")
    await SecureStore.deleteItemAsync("pronolol.session.userId")

    // Clear any other stored keys that might exist
    const keys = ["pronolol.user", "pronolol.token", "pronolol.refreshToken"]
    await Promise.all(
      keys.map((key) =>
        SecureStore.deleteItemAsync(key).catch(() => {
          // Ignore errors for keys that don't exist
        })
      )
    )

    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    // Even if server call fails, clear local storage
    try {
      await SecureStore.deleteItemAsync("pronolol.session.token")
      await SecureStore.deleteItemAsync("pronolol.session.userId")
    } catch (e) {
      console.error("Error clearing storage:", e)
    }
    return { error }
  }
}
