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

const makeProps = (
  overrides: Partial<{
    matchTime: string
    league: string
    score: { teamA: number; teamB: number }
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
