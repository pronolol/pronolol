import { createAuthClient } from "better-auth/react"
import { API_BASE_URL } from "@/config/env"

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  basePath: "/auth",
  fetchOptions: {
    credentials: "include",
    onError(context) {
      console.error("Auth error:", context.error)
    },
  },
})

export const { signIn, signUp, useSession, $fetch } = authClient

export const signOut = async () => {
  try {
    await authClient.signOut()
    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    return { error }
  }
}
