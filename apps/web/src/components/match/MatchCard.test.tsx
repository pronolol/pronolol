import { vi, describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/utils"
import { MatchCard } from "./MatchCard"

// ─── Factories ────────────────────────────────────────────────────────────────

const makeTeam = (tag: string, overrides: Partial<{ logoUrl: string }> = {}) => ({
  name: tag,
  logoUrl: overrides.logoUrl ?? `https://example.com/${tag.toLowerCase()}.png`,
})

const makePrediction = (
  overrides: Partial<{
    isCorrect: boolean | null
    isExact: boolean | null
  }> = {}
) => ({
  teamTag: "TLA",
  teamLogoUrl: "https://example.com/tla.png",
  scoreA: 2,
  scoreB: 1,
  isCorrect: null,
  isExact: null,
  ...overrides,
})

const makeProps = (
  overrides: Partial<{
    matchTime: string
    league: string
    score: { teamA: number; teamB: number }
    prediction: ReturnType<typeof makePrediction>
    onPress: () => void
  }> = {}
) => ({
  teamA: makeTeam("TLA"),
  teamB: makeTeam("TLB"),
  ...overrides,
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MatchCard", () => {
  describe("rendering", () => {
    it("displays both team tags", () => {
      renderWithProviders(<MatchCard {...makeProps()} />)
      expect(screen.getByText("TLA")).toBeInTheDocument()
      expect(screen.getByText("TLB")).toBeInTheDocument()
    })

    it("displays match time when provided", () => {
      renderWithProviders(<MatchCard {...makeProps({ matchTime: "18:00" })} />)
      expect(screen.getByText("18:00")).toBeInTheDocument()
    })

    it("displays league name when provided", () => {
      renderWithProviders(
        <MatchCard {...makeProps({ league: "LEC - Spring Split" })} />
      )
      expect(screen.getByText("LEC - Spring Split")).toBeInTheDocument()
    })
  })

  describe("score display", () => {
    it("shows formatted score when a score is provided", () => {
      renderWithProviders(
        <MatchCard {...makeProps({ score: { teamA: 2, teamB: 1 } })} />
      )
      expect(screen.getByText("2 - 1")).toBeInTheDocument()
    })

    it("shows VS label when no score is available", () => {
      renderWithProviders(<MatchCard {...makeProps()} />)
      expect(screen.getByText("VS")).toBeInTheDocument()
    })
  })

  describe("prediction badge", () => {
    it("shows the predicted team tag and score when a prediction is provided", () => {
      renderWithProviders(
        <MatchCard {...makeProps({ league: "LEC", prediction: makePrediction() })} />
      )
      expect(screen.getByText("TLA 2-1")).toBeInTheDocument()
    })

    it("does not show a prediction badge when no prediction is provided", () => {
      renderWithProviders(<MatchCard {...makeProps({ league: "LEC" })} />)
      expect(screen.queryByText(/2-1/)).not.toBeInTheDocument()
    })

    it("applies success styles for an exact prediction", () => {
      renderWithProviders(
        <MatchCard
          {...makeProps({
            league: "LEC",
            prediction: makePrediction({ isCorrect: true, isExact: true }),
          })}
        />
      )
      expect(screen.getByText("TLA 2-1").parentElement).toHaveClass("bg-success-light")
    })

    it("applies primary styles for a correct but non-exact prediction", () => {
      renderWithProviders(
        <MatchCard
          {...makeProps({
            league: "LEC",
            prediction: makePrediction({ isCorrect: true, isExact: false }),
          })}
        />
      )
      expect(screen.getByText("TLA 2-1").parentElement).toHaveClass("bg-primary-light")
    })

    it("applies error styles for a wrong prediction", () => {
      renderWithProviders(
        <MatchCard
          {...makeProps({
            league: "LEC",
            prediction: makePrediction({ isCorrect: false, isExact: false }),
          })}
        />
      )
      expect(screen.getByText("TLA 2-1").parentElement).toHaveClass("bg-error-light")
    })

    it("applies neutral styles for a pending prediction", () => {
      renderWithProviders(
        <MatchCard
          {...makeProps({
            league: "LEC",
            prediction: makePrediction({ isCorrect: null, isExact: null }),
          })}
        />
      )
      expect(screen.getByText("TLA 2-1").parentElement).toHaveClass("bg-surface")
    })
  })

  describe("interactions", () => {
    it("calls onPress when the card is clicked", async () => {
      const onPress = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<MatchCard {...makeProps({ onPress })} />)
      await user.click(screen.getByRole("button"))
      expect(onPress).toHaveBeenCalledOnce()
    })

    it("does not render a button when onPress is not provided", () => {
      renderWithProviders(<MatchCard {...makeProps()} />)
      expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })
  })
})
