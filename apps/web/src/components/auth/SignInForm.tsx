import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleDiscordSignIn = () => {
    setIsLoading(true)
    signIn
      .social({
        provider: "discord",
        callbackURL: `${window.location.origin}/callback`,
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Discord sign in failed")
        setIsLoading(false)
      })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn.email({ email, password })
      if (result?.error) {
        setError(result.error.message || "Invalid credentials")
      } else {
        navigate("/")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
        <p className="text-sm text-text-secondary mt-1">Sign in to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
        />

        {error && (
          <p className="text-sm text-error bg-error-light px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button type="submit" loading={isLoading} className="w-full mt-2">
          Sign In
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button
          type="button"
          variant="discord"
          loading={isLoading}
          onClick={handleDiscordSignIn}
          className="w-full"
        >
          Continue with Discord
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          to="/sign-up"
          className="text-primary font-medium hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  )
}
