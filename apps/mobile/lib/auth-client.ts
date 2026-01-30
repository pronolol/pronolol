import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import * as SecureStore from "expo-secure-store"
import { API_BASE_URL } from "@/config/env"

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: "pronolol",
      storagePrefix: "pronolol",
      storage: SecureStore,
    }),
  ],
})

export const { signIn, signUp, signOut, useSession, $fetch } = authClient
