import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/lib/auth-client"

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { refetch } = useSession()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        await refetch()
        await new Promise((resolve) => setTimeout(resolve, 300))
        navigate("/", { replace: true })
      } catch (error) {
        console.error("Callback error:", error)
        navigate("/sign-in", { replace: true })
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-text-secondary">Completing sign in...</p>
      </div>
    </div>
  )
}
