import React, { createContext, useContext, useEffect, useState } from "react"
import { useSession as useBetterAuthSession } from "./auth-client"
import * as SecureStore from "expo-secure-store"

interface User {
  id: string
  email: string
  name?: string
  username?: string
  displayUsername?: string
}

interface AuthContextType {
  user: User | null
  session: any
  isLoading: boolean
  isAuthenticated: boolean
  refetchSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  refetchSession: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, isPending, refetch } = useBetterAuthSession()

  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize and restore session on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a stored session token
        const token = await SecureStore.getItemAsync("pronolol.session.token")

        if (token) {
          // If we have a token, refetch the session to validate it
          await refetch()
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [])

  const refetchSession = async () => {
    try {
      await refetch()
    } catch (error) {
      console.error("Error refetching session:", error)
    }
  }

  const isLoading = isPending || !isInitialized
  const isAuthenticated = !!session?.user && !!session?.session

  const value: AuthContextType = {
    user: session?.user || null,
    session: session?.session || null,
    isLoading,
    isAuthenticated,
    refetchSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
