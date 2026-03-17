import { vi, describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/utils"
import { MatchFeedFilters } from "./MatchFeedFilters"
import type { LeagueOption } from "@/hooks/useMatchFilters"

// ─── Factories ────────────────────────────────────────────────────────────────

const makeLeague = (id: string, name: string): LeagueOption => ({
  id,
  name,
  imageUrl: `https://example.com/${id}.png`,
  tournaments: [
    { id: `${id}-t1`, name: "Spring Split" },
    { id: `${id}-t2`, name: "Summer Split" },
  ],
})

const makeProps = (
  overrides: Partial<{
    leagues: LeagueOption[]
    selectedLeagueIds: string[]
    onLeagueToggle: (id: string) => void
    onClearLeagues: () => void
  }> = {}
) => ({
  leagues: [makeLeague("lec", "LEC"), makeLeague("lck", "LCK")],
  selectedLeagueIds: [],
  onLeagueToggle: vi.fn(),
  onClearLeagues: vi.fn(),
  ...overrides,
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MatchFeedFilters", () => {
  describe("rendering", () => {
    it("renders nothing when leagues list is empty", () => {
      const { container } = renderWithProviders(
        <MatchFeedFilters {...makeProps({ leagues: [] })} />
      )
      expect(container).toBeEmptyDOMElement()
    })

    it("renders an All leagues pill", () => {
      renderWithProviders(<MatchFeedFilters {...makeProps()} />)
      expect(screen.getByText("All leagues")).toBeInTheDocument()
    })

    it("renders a pill for each league", () => {
      renderWithProviders(<MatchFeedFilters {...makeProps()} />)
      expect(screen.getByText("LEC")).toBeInTheDocument()
      expect(screen.getByText("LCK")).toBeInTheDocument()
    })

    it("does not show a tournament dropdown", () => {
      renderWithProviders(
        <MatchFeedFilters {...makeProps({ selectedLeagueIds: ["lec"] })} />
      )
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
    })
  })

  describe("active state", () => {
    it("applies primary style to All leagues pill when no league is selected", () => {
      renderWithProviders(<MatchFeedFilters {...makeProps()} />)
      expect(screen.getByText("All leagues")).toHaveClass("bg-primary")
    })

    it("does not apply primary style to All leagues when a league is selected", () => {
      renderWithProviders(
        <MatchFeedFilters {...makeProps({ selectedLeagueIds: ["lec"] })} />
      )
      expect(screen.getByText("All leagues")).not.toHaveClass("bg-primary")
    })

    it("applies primary style to each selected league pill", () => {
      renderWithProviders(
        <MatchFeedFilters
          {...makeProps({ selectedLeagueIds: ["lec", "lck"] })}
        />
      )
      expect(screen.getByText("LEC")).toHaveClass("bg-primary")
      expect(screen.getByText("LCK")).toHaveClass("bg-primary")
    })

    it("only applies primary style to the selected league, not unselected ones", () => {
      renderWithProviders(
        <MatchFeedFilters {...makeProps({ selectedLeagueIds: ["lec"] })} />
      )
      expect(screen.getByText("LEC")).toHaveClass("bg-primary")
      expect(screen.getByText("LCK")).not.toHaveClass("bg-primary")
    })
  })

  describe("interactions", () => {
    it("calls onClearLeagues when All leagues is clicked", async () => {
      const onClearLeagues = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <MatchFeedFilters {...makeProps({ onClearLeagues })} />
      )
      await user.click(screen.getByText("All leagues"))
      expect(onClearLeagues).toHaveBeenCalledOnce()
    })

    it("calls onLeagueToggle with the league id when a league pill is clicked", async () => {
      const onLeagueToggle = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <MatchFeedFilters {...makeProps({ onLeagueToggle })} />
      )
      await user.click(screen.getByText("LEC"))
      expect(onLeagueToggle).toHaveBeenCalledWith("lec")
    })

    it("calls onLeagueToggle again to deselect an already-selected league", async () => {
      const onLeagueToggle = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <MatchFeedFilters
          {...makeProps({ selectedLeagueIds: ["lec"], onLeagueToggle })}
        />
      )
      await user.click(screen.getByText("LEC"))
      expect(onLeagueToggle).toHaveBeenCalledWith("lec")
    })
  })
})
