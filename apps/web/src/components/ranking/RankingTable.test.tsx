import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test/utils"
import { RankingTable, type RankingEntry } from "./RankingTable"

// ─── Factories ────────────────────────────────────────────────────────────────

const makeEntry = (
  userId: string,
  rank: number,
  displayName: string,
  overrides: Partial<RankingEntry> = {}
): RankingEntry => ({
  userId,
  rank,
  displayName,
  username: null,
  image: null,
  totalPoints: 100,
  totalPredictions: 10,
  correctPredictions: 7,
  exactPredictions: 2,
  correctnessPercentage: 70,
  ...overrides,
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("RankingTable", () => {
  describe("rendering", () => {
    it("displays all entry names", () => {
      const entries = [makeEntry("u1", 1, "Alice"), makeEntry("u2", 2, "Bob")]
      renderWithProviders(<RankingTable entries={entries} />)
      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })

    it("shows points and correctness percentage for each entry", () => {
      const entries = [makeEntry("u1", 1, "Alice", { totalPoints: 150, correctnessPercentage: 75 })]
      renderWithProviders(<RankingTable entries={entries} />)
      expect(screen.getByText("150")).toBeInTheDocument()
      expect(screen.getByText("75%")).toBeInTheDocument()
    })
  })

  describe("medals", () => {
    it("shows medal emojis for the top 3 ranks", () => {
      const entries = [
        makeEntry("u1", 1, "Alice"),
        makeEntry("u2", 2, "Bob"),
        makeEntry("u3", 3, "Carol"),
      ]
      renderWithProviders(<RankingTable entries={entries} />)
      expect(screen.getByText("🥇")).toBeInTheDocument()
      expect(screen.getByText("🥈")).toBeInTheDocument()
      expect(screen.getByText("🥉")).toBeInTheDocument()
    })

    it("shows a numeric rank for entries outside the top 3", () => {
      const entries = [makeEntry("u1", 4, "Dave")]
      renderWithProviders(<RankingTable entries={entries} />)
      expect(screen.getByText("4")).toBeInTheDocument()
    })
  })

  describe("current user highlight", () => {
    it("appends (You) label to the current user's entry", () => {
      const entries = [makeEntry("u1", 1, "Alice"), makeEntry("u2", 2, "Bob")]
      renderWithProviders(<RankingTable entries={entries} currentUserId="u2" />)
      expect(screen.getByText("(You)")).toBeInTheDocument()
    })

    it("does not show a (You) label when currentUserId is not provided", () => {
      const entries = [makeEntry("u1", 1, "Alice")]
      renderWithProviders(<RankingTable entries={entries} />)
      expect(screen.queryByText("(You)")).not.toBeInTheDocument()
    })

    it("does not show a (You) label when currentUserId matches no entry", () => {
      const entries = [makeEntry("u1", 1, "Alice")]
      renderWithProviders(
        <RankingTable entries={entries} currentUserId="unknown" />
      )
      expect(screen.queryByText("(You)")).not.toBeInTheDocument()
    })
  })
})
