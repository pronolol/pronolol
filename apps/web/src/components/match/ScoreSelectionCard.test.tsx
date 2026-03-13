import { vi, describe, it, expect } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/utils"
import { ScoreSelectionCard } from "./ScoreSelectionCard"

// ─── Factories ────────────────────────────────────────────────────────────────

const makeTeam = (tag = "TLA") => ({
  id: "team-a",
  tag,
  logoUrl: `https://example.com/${tag.toLowerCase()}.png`,
})

const makeScore = (teamA: number, teamB: number) => ({ teamA, teamB })

const makeProps = (
  overrides: Partial<{
    selectedScore: { teamA: number; teamB: number } | null
    isSubmitting: boolean
    error: string | null
  }> = {}
) => ({
  selectedTeam: makeTeam(),
  possibleScores: [makeScore(2, 0), makeScore(2, 1)],
  selectedScore: null,
  onSelectScore: vi.fn(),
  onSubmit: vi.fn(),
  isSubmitting: false,
  ...overrides,
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ScoreSelectionCard", () => {
  describe("rendering", () => {
    it("shows the selected team tag in the header badge", () => {
      renderWithProviders(<ScoreSelectionCard {...makeProps()} />)
      expect(screen.getByText(/TLA wins/)).toBeInTheDocument()
    })

    it("renders all available score options", () => {
      renderWithProviders(<ScoreSelectionCard {...makeProps()} />)
      expect(screen.getByText("2 - 0")).toBeInTheDocument()
      expect(screen.getByText("2 - 1")).toBeInTheDocument()
    })

    it("hides the submit button when no score is selected", () => {
      renderWithProviders(
        <ScoreSelectionCard {...makeProps({ selectedScore: null })} />
      )
      expect(
        screen.queryByRole("button", { name: /submit prediction/i })
      ).not.toBeInTheDocument()
    })

    it("shows the submit button when a score is selected", () => {
      renderWithProviders(
        <ScoreSelectionCard
          {...makeProps({ selectedScore: makeScore(2, 0) })}
        />
      )
      expect(
        screen.getByRole("button", { name: /submit prediction/i })
      ).toBeInTheDocument()
    })

    it("displays an error message when provided", () => {
      renderWithProviders(
        <ScoreSelectionCard
          {...makeProps({ error: "Failed to submit prediction" })}
        />
      )
      expect(
        screen.getByText("Failed to submit prediction")
      ).toBeInTheDocument()
    })
  })

  describe("interactions", () => {
    it("calls onSelectScore with the clicked score", async () => {
      const onSelectScore = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <ScoreSelectionCard {...makeProps()} onSelectScore={onSelectScore} />
      )
      await user.click(screen.getByText("2 - 1"))
      expect(onSelectScore).toHaveBeenCalledWith(makeScore(2, 1))
    })

    it("calls onSubmit when the submit button is clicked", async () => {
      const onSubmit = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <ScoreSelectionCard
          {...makeProps({ selectedScore: makeScore(2, 0) })}
          onSubmit={onSubmit}
        />
      )
      await user.click(
        screen.getByRole("button", { name: /submit prediction/i })
      )
      await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    })

    it("disables the submit button while submitting", () => {
      renderWithProviders(
        <ScoreSelectionCard
          {...makeProps({ selectedScore: makeScore(2, 0), isSubmitting: true })}
        />
      )
      expect(
        screen.getByRole("button", { name: /submit prediction/i })
      ).toBeDisabled()
    })
  })
})
