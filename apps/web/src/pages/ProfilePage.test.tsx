import { vi, describe, it, expect, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/mocks/server"
import { renderWithProviders } from "@/test/utils"
import { ProfilePage } from "./ProfilePage"

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: {
      id: "user-1",
      email: "alice@example.com",
      name: "Alice",
      image: null,
      username: "alice",
      displayUsername: "Alice",
    },
    isLoading: false,
    isAuthenticated: true,
  }),
}))

const API_URL = "http://localhost:3000"

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows display name and email", async () => {
    renderWithProviders(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument()
    })
    expect(screen.getByText("alice@example.com")).toBeInTheDocument()
  })

  it("shows stat values from ranking", async () => {
    renderWithProviders(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByText("#1")).toBeInTheDocument()
    })
    expect(screen.getByText("150")).toBeInTheDocument()
    expect(screen.getByText("75%")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("shows dash stats when user not in rankings", async () => {
    server.use(
      http.get(`${API_URL}/ranking`, () => {
        return HttpResponse.json({ rankings: [], filters: {} })
      })
    )
    renderWithProviders(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getAllByText("—")).toHaveLength(4)
    })
  })

  it("renders all league names as toggle buttons", async () => {
    renderWithProviders(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByText("LEC")).toBeInTheDocument()
    })
    expect(screen.getByText("LCK")).toBeInTheDocument()
  })

  it("Save button is disabled when nothing has changed", async () => {
    renderWithProviders(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByText("LEC")).toBeInTheDocument()
    })
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled()
  })

  it("toggling a league enables Save", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByText("LEC")).toBeInTheDocument()
    })
    await user.click(screen.getByText("LEC"))
    expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled()
  })

  it("clicking Save calls PUT /users/me/preferences with correct payload", async () => {
    const user = userEvent.setup()
    let capturedBody: unknown = null
    server.use(
      http.put(`${API_URL}/users/me/preferences`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ leagueIds: ["league-1"] })
      })
    )
    renderWithProviders(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByText("LEC")).toBeInTheDocument()
    })
    await user.click(screen.getByText("LEC"))
    await user.click(screen.getByRole("button", { name: /save/i }))
    await waitFor(() => {
      expect(capturedBody).toMatchObject({ leagueIds: ["league-1"] })
    })
  })

  it("shows error message on save failure", async () => {
    const user = userEvent.setup()
    server.use(
      http.put(`${API_URL}/users/me/preferences`, () => {
        return HttpResponse.json({ error: "Server error" }, { status: 500 })
      })
    )
    renderWithProviders(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByText("LEC")).toBeInTheDocument()
    })
    await user.click(screen.getByText("LEC"))
    await user.click(screen.getByRole("button", { name: /save/i }))
    await waitFor(() => {
      expect(
        screen.getByText(/failed to save preferences/i)
      ).toBeInTheDocument()
    })
  })

  it("shows skeletons while data is loading", () => {
    renderWithProviders(<ProfilePage />)
    const skeletons = document.querySelectorAll(".animate-pulse")
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
