import React, { createContext, useContext, useEffect, useState } from "react"
import { useSession as useBetterAuthSession } from "./auth-client"

interface User {
  id: string
  email: string
  name?: string
  image?: string | null
  username?: string
  displayUsername?: string
}

interface AuthContextType {
  user: User | null
  session: unknown
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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refetch()
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
    user: (session?.user as User) || null,
    session: session?.session || null,
    isLoading,
    isAuthenticated,
    refetchSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
