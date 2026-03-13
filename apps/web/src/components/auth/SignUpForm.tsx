import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { signIn, signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SignUpForm() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleDiscordSignUp = () => {
    setIsLoading(true)
    signIn
      .social({
        provider: "discord",
        callbackURL: `${window.location.origin}/callback`,
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Discord sign up failed")
        setIsLoading(false)
      })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await (
        signUp.email as (data: {
          email: string
          password: string
          name: string
          username: string
        }) => Promise<{ data?: unknown; error?: { message?: string } }>
      )({
        email,
        password,
        name: username,
        username,
      })
      if (result?.error) {
        setError(result.error.message || "Could not create account")
      } else {
        navigate("/")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
        <p className="text-sm text-text-secondary mt-1">
          Sign up to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Username"
          type="text"
          placeholder="johndoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          autoComplete="username"
        />

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
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="new-password"
        />

        {error && (
          <p className="text-sm text-error bg-error-light px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button type="submit" loading={isLoading} className="w-full mt-2">
          Sign Up
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
          onClick={handleDiscordSignUp}
          className="w-full"
        >
          Continue with Discord
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          to="/sign-in"
          className="text-primary font-medium hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  )
}
