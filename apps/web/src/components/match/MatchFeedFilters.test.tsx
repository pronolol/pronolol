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
    tournaments: { id: string; name: string }[]
    selectedLeagueId: string | null
    selectedTournamentId: string | null
    onLeagueChange: (id: string | null) => void
    onTournamentChange: (id: string | null) => void
  }> = {}
) => ({
  leagues: [makeLeague("lec", "LEC"), makeLeague("lck", "LCK")],
  tournaments: [],
  selectedLeagueId: null,
  selectedTournamentId: null,
  onLeagueChange: vi.fn(),
  onTournamentChange: vi.fn(),
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

    it("does not show the tournament dropdown when no league is selected", () => {
      renderWithProviders(<MatchFeedFilters {...makeProps()} />)
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
    })

    it("shows the tournament dropdown when a league is selected and tournaments exist", () => {
      renderWithProviders(
        <MatchFeedFilters
          {...makeProps({
            selectedLeagueId: "lec",
            tournaments: [
              { id: "t1", name: "Spring Split" },
              { id: "t2", name: "Summer Split" },
            ],
          })}
        />
      )
      expect(screen.getByRole("combobox")).toBeInTheDocument()
      expect(screen.getByText("Spring Split")).toBeInTheDocument()
      expect(screen.getByText("Summer Split")).toBeInTheDocument()
    })

    it("does not show tournament dropdown when a league is selected but has no tournaments", () => {
      renderWithProviders(
        <MatchFeedFilters
          {...makeProps({
            selectedLeagueId: "lec",
            tournaments: [],
          })}
        />
      )
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
    })
  })

  describe("active state", () => {
    it("applies primary style to the All leagues pill when no league is selected", () => {
      renderWithProviders(<MatchFeedFilters {...makeProps()} />)
      expect(screen.getByText("All leagues")).toHaveClass("bg-primary")
    })

    it("applies primary style to the selected league pill", () => {
      renderWithProviders(
        <MatchFeedFilters {...makeProps({ selectedLeagueId: "lec" })} />
      )
      expect(screen.getByText("LEC")).toHaveClass("bg-primary")
      expect(screen.getByText("All leagues")).not.toHaveClass("bg-primary")
    })
  })

  describe("interactions", () => {
    it("calls onLeagueChange(null) when All leagues is clicked", async () => {
      const onLeagueChange = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <MatchFeedFilters {...makeProps({ onLeagueChange })} />
      )
      await user.click(screen.getByText("All leagues"))
      expect(onLeagueChange).toHaveBeenCalledWith(null)
    })

    it("calls onLeagueChange with the league id when a league pill is clicked", async () => {
      const onLeagueChange = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <MatchFeedFilters {...makeProps({ onLeagueChange })} />
      )
      await user.click(screen.getByText("LEC"))
      expect(onLeagueChange).toHaveBeenCalledWith("lec")
    })

    it("calls onTournamentChange with the tournament id when one is selected", async () => {
      const onTournamentChange = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <MatchFeedFilters
          {...makeProps({
            selectedLeagueId: "lec",
            tournaments: [
              { id: "t1", name: "Spring Split" },
              { id: "t2", name: "Summer Split" },
            ],
            onTournamentChange,
          })}
        />
      )
      await user.selectOptions(screen.getByRole("combobox"), "t2")
      expect(onTournamentChange).toHaveBeenCalledWith("t2")
    })

    it("calls onTournamentChange(null) when All tournaments is selected", async () => {
      const onTournamentChange = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <MatchFeedFilters
          {...makeProps({
            selectedLeagueId: "lec",
            selectedTournamentId: "t1",
            tournaments: [{ id: "t1", name: "Spring Split" }],
            onTournamentChange,
          })}
        />
      )
      await user.selectOptions(screen.getByRole("combobox"), "")
      expect(onTournamentChange).toHaveBeenCalledWith(null)
    })
  })
})
