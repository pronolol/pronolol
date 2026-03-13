import { vi, describe, it, expect, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/utils"
import { SignUpForm } from "./SignUpForm"

vi.mock("@/lib/auth-client", () => ({
  signIn: {
    social: vi.fn().mockResolvedValue({}),
  },
  signUp: {
    email: vi.fn().mockResolvedValue({ data: { user: {} } }),
  },
  signOut: vi.fn().mockResolvedValue({ success: true }),
  useSession: vi
    .fn()
    .mockReturnValue({ data: null, isPending: false, refetch: vi.fn() }),
  $fetch: vi.fn(),
}))

// ─── Factories ────────────────────────────────────────────────────────────────

const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<{
    username: string
    email: string
    password: string
    confirmPassword: string
  }> = {}
) => {
  const {
    username = "johndoe",
    email = "test@example.com",
    password = "password123",
    confirmPassword = "password123",
  } = overrides
  await user.type(screen.getByLabelText("Username"), username)
  await user.type(screen.getByLabelText("Email"), email)
  await user.type(screen.getByLabelText("Password"), password)
  await user.type(screen.getByLabelText("Confirm Password"), confirmPassword)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SignUpForm", () => {
  beforeEach(() => vi.clearAllMocks())

  describe("rendering", () => {
    it("displays all required inputs", () => {
      renderWithProviders(<SignUpForm />)
      expect(screen.getByLabelText("Username")).toBeInTheDocument()
      expect(screen.getByLabelText("Email")).toBeInTheDocument()
      expect(screen.getByLabelText("Password")).toBeInTheDocument()
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument()
    })

    it("displays a Discord sign up button", () => {
      renderWithProviders(<SignUpForm />)
      expect(
        screen.getByRole("button", { name: /continue with discord/i })
      ).toBeInTheDocument()
    })

    it("links to the sign in page", () => {
      renderWithProviders(<SignUpForm />)
      expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument()
    })
  })

  describe("validation", () => {
    it("shows an error when any field is empty", async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignUpForm />)
      await user.click(screen.getByRole("button", { name: /sign up/i }))
      await waitFor(() =>
        expect(screen.getByText("Please fill in all fields")).toBeInTheDocument()
      )
    })

    it("shows an error when passwords do not match", async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignUpForm />)
      await fillForm(user, { confirmPassword: "different" })
      await user.click(screen.getByRole("button", { name: /sign up/i }))
      await waitFor(() =>
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
      )
    })

    it("shows an error when password is shorter than 6 characters", async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignUpForm />)
      await fillForm(user, { password: "abc", confirmPassword: "abc" })
      await user.click(screen.getByRole("button", { name: /sign up/i }))
      await waitFor(() =>
        expect(
          screen.getByText("Password must be at least 6 characters")
        ).toBeInTheDocument()
      )
    })
  })
})
