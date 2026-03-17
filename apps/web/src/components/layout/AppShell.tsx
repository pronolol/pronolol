import { Outlet, Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth-context"
import { signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export const AppShell = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const displayName =
    (user as { displayUsername?: string; username?: string; name?: string })
      ?.displayUsername ||
    (user as { username?: string })?.username ||
    user?.name ||
    "User"

  const handleSignOut = async () => {
    await signOut()
    navigate("/sign-in")
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="font-bold text-lg text-primary hover:opacity-80 transition-opacity"
          >
            Pronolol
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/ranking"
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-light"
            >
              Rankings
            </Link>
            <span className="text-sm text-text-muted hidden sm:block">
              {displayName}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
