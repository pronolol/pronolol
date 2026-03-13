import { vi, describe, it, expect, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/utils"
import { SignInForm } from "./SignInForm"

vi.mock("@/lib/auth-client", () => ({
  signIn: {
    email: vi.fn().mockResolvedValue({ data: { user: {} } }),
    social: vi.fn().mockResolvedValue({}),
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
  email = "test@example.com",
  password = "password123"
) => {
  await user.type(screen.getByLabelText("Email"), email)
  await user.type(screen.getByLabelText("Password"), password)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SignInForm", () => {
  beforeEach(() => vi.clearAllMocks())

  describe("rendering", () => {
    it("displays email and password inputs", () => {
      renderWithProviders(<SignInForm />)
      expect(screen.getByLabelText("Email")).toBeInTheDocument()
      expect(screen.getByLabelText("Password")).toBeInTheDocument()
    })

    it("displays a sign in button", () => {
      renderWithProviders(<SignInForm />)
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
    })

    it("displays a Discord sign in button", () => {
      renderWithProviders(<SignInForm />)
      expect(
        screen.getByRole("button", { name: /continue with discord/i })
      ).toBeInTheDocument()
    })

    it("links to the sign up page", () => {
      renderWithProviders(<SignInForm />)
      expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument()
    })
  })

  describe("validation", () => {
    it("shows an error when fields are empty on submit", async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignInForm />)
      await user.click(screen.getByRole("button", { name: /sign in/i }))
      await waitFor(() =>
        expect(screen.getByText("Please fill in all fields")).toBeInTheDocument()
      )
    })
  })

  describe("submission", () => {
    it("calls signIn.email with the entered credentials", async () => {
      const { signIn } = await import("@/lib/auth-client")
      const user = userEvent.setup()
      renderWithProviders(<SignInForm />)
      await fillForm(user)
      await user.click(screen.getByRole("button", { name: /sign in/i }))
      await waitFor(() =>
        expect(signIn.email).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        })
      )
    })
  })
})
