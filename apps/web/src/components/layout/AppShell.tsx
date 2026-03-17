import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/lib/auth-context"
import { signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export const AppShell = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const displayName =
    user?.displayUsername || user?.username || user?.name || "User"
  const avatarUrl = user?.image

  const handleSignOut = async () => {
    await signOut()
    navigate("/sign-in")
  }

  const navLinks = [
    { to: "/", label: "Feed" },
    { to: "/ranking", label: "Rankings" },
  ]

  return (
    <div className="min-h-screen bg-background-secondary overflow-x-hidden">
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="font-bold text-lg text-primary hover:opacity-80 transition-opacity shrink-0"
          >
            Pronolol
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label }) => {
              const isActive = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "text-primary bg-primary-light"
                      : "text-text-secondary hover:text-primary hover:bg-primary-light"
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-2 shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-primary text-xs font-semibold border border-border">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-text-secondary hidden sm:block max-w-[120px] truncate">
              {displayName}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
