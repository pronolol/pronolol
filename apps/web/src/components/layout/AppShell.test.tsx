import { vi, describe, it, expect, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@/lib/theme-context"
import { AppShell } from "./AppShell"

vi.mock("@/lib/auth-client", () => ({
  signOut: vi.fn().mockResolvedValue({ success: true }),
  useSession: vi
    .fn()
    .mockReturnValue({ data: null, isPending: false, refetch: vi.fn() }),
  $fetch: vi.fn(),
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { name: "Alice", username: "alice", displayUsername: "alice" },
    isLoading: false,
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

const renderAppShell = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppShell />
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

describe("AppShell theme toggle", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
  })

  it("renders the theme toggle button", () => {
    renderAppShell()
    expect(
      screen.getByRole("button", { name: /switch to dark theme/i })
    ).toBeInTheDocument()
  })

  it("toggles to dark theme when clicked", async () => {
    const user = userEvent.setup()
    renderAppShell()
    const toggle = screen.getByRole("button", { name: /switch to dark theme/i })
    await user.click(toggle)
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(
      screen.getByRole("button", { name: /switch to light theme/i })
    ).toBeInTheDocument()
  })

  it("toggles back to light theme on second click", async () => {
    const user = userEvent.setup()
    renderAppShell()
    const toggle = screen.getByRole("button", { name: /switch to dark theme/i })
    await user.click(toggle)
    await user.click(
      screen.getByRole("button", { name: /switch to light theme/i })
    )
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })
})
