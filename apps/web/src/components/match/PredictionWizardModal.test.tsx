import { describe, it, expect, vi } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/utils"
import { PredictionWizardModal } from "./PredictionWizardModal"
import type { Match, Team, MyPrediction } from "@/api/generated/models"

const makeMatch = (overrides: Partial<Match> = {}): Match => ({
  id: "match-1",
  matchDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  state: "upcoming",
  bestOf: 3,
  stage: null,
  teamA: { id: "team-a", name: "Team Alpha", tag: "TLA", logoUrl: "" },
  teamB: { id: "team-b", name: "Team Beta", tag: "TLB", logoUrl: "" },
  winner: null as unknown as Team,
  teamAScore: null,
  teamBScore: null,
  tournament: {
    id: "t1",
    name: "Spring Split",
    league: { id: "l1", name: "LEC", imageUrl: "" },
  },
  myPrediction: null as unknown as MyPrediction,
  ...overrides,
})

const defaultProps = {
  isOpen: true,
  currentMatch: makeMatch(),
  progress: { done: 0, total: 3 },
  phase: "predicting" as const,
  skippedCount: 0,
  onSkip: vi.fn(),
  onAdvance: vi.fn(),
  onStartReview: vi.fn(),
  onClose: vi.fn(),
}

describe("PredictionWizardModal", () => {
  it("renders nothing when not open", () => {
    const { container } = renderWithProviders(
      <PredictionWizardModal {...defaultProps} isOpen={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders score grid for bestOf=3", () => {
    renderWithProviders(<PredictionWizardModal {...defaultProps} />)
    expect(screen.getByText("2-0")).toBeInTheDocument()
    expect(screen.getByText("2-1")).toBeInTheDocument()
    expect(screen.getByText("0-2")).toBeInTheDocument()
    expect(screen.getByText("1-2")).toBeInTheDocument()
  })

  it("shows correct progress indicator", () => {
    renderWithProviders(
      <PredictionWizardModal
        {...defaultProps}
        progress={{ done: 1, total: 5 }}
      />
    )
    expect(screen.getByText("Match 2/5")).toBeInTheDocument()
  })

  it("shows league and tournament name", () => {
    renderWithProviders(<PredictionWizardModal {...defaultProps} />)
    expect(screen.getByText("LEC")).toBeInTheDocument()
    expect(screen.getByText("Spring Split")).toBeInTheDocument()
  })

  it("shows both team tags", () => {
    renderWithProviders(<PredictionWizardModal {...defaultProps} />)
    expect(screen.getAllByText("TLA").length).toBeGreaterThan(0)
    expect(screen.getAllByText("TLB").length).toBeGreaterThan(0)
  })

  it("auto-submits on score tile click and calls onAdvance", async () => {
    const onAdvance = vi.fn()
    renderWithProviders(
      <PredictionWizardModal {...defaultProps} onAdvance={onAdvance} />
    )
    await userEvent.click(screen.getByText("2-0"))
    await waitFor(() => expect(onAdvance).toHaveBeenCalled(), { timeout: 2000 })
  })

  it("calls onSkip when skip button is clicked", async () => {
    const onSkip = vi.fn()
    renderWithProviders(
      <PredictionWizardModal {...defaultProps} onSkip={onSkip} />
    )
    await userEvent.click(screen.getByText("Skip →"))
    expect(onSkip).toHaveBeenCalled()
  })

  it("calls onClose when exit button is clicked", async () => {
    const onClose = vi.fn()
    renderWithProviders(
      <PredictionWizardModal {...defaultProps} onClose={onClose} />
    )
    await userEvent.click(screen.getByText("✕ Exit"))
    expect(onClose).toHaveBeenCalled()
  })

  it("renders review-skipped screen with correct skipped count", () => {
    renderWithProviders(
      <PredictionWizardModal
        {...defaultProps}
        currentMatch={null}
        phase="review-skipped"
        skippedCount={2}
      />
    )
    expect(screen.getByText(/You skipped 2 matches/)).toBeInTheDocument()
    expect(screen.getByText("Review")).toBeInTheDocument()
    expect(screen.getByText("Close")).toBeInTheDocument()
  })

  it("uses singular form for 1 skipped match", () => {
    renderWithProviders(
      <PredictionWizardModal
        {...defaultProps}
        currentMatch={null}
        phase="review-skipped"
        skippedCount={1}
      />
    )
    expect(screen.getByText(/You skipped 1 match —/)).toBeInTheDocument()
  })

  it("calls onStartReview when Review button is clicked", async () => {
    const onStartReview = vi.fn()
    renderWithProviders(
      <PredictionWizardModal
        {...defaultProps}
        currentMatch={null}
        phase="review-skipped"
        skippedCount={1}
        onStartReview={onStartReview}
      />
    )
    await userEvent.click(screen.getByText("Review"))
    expect(onStartReview).toHaveBeenCalled()
  })

  it("renders done screen", () => {
    renderWithProviders(
      <PredictionWizardModal
        {...defaultProps}
        currentMatch={null}
        phase="done"
      />
    )
    expect(screen.getByText(/All caught up/)).toBeInTheDocument()
    expect(screen.getByText("Close")).toBeInTheDocument()
  })

  it("calls onClose from done screen", async () => {
    const onClose = vi.fn()
    renderWithProviders(
      <PredictionWizardModal
        {...defaultProps}
        currentMatch={null}
        phase="done"
        onClose={onClose}
      />
    )
    await userEvent.click(screen.getByText("Close"))
    expect(onClose).toHaveBeenCalled()
  })
})
