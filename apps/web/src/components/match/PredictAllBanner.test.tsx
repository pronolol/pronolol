import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { PredictAllBanner } from "./PredictAllBanner"

describe("PredictAllBanner", () => {
  it("renders with plural count", () => {
    render(<PredictAllBanner count={5} onStart={() => {}} />)
    expect(screen.getByText(/5 matches to predict/)).toBeInTheDocument()
  })

  it("uses singular form for count=1", () => {
    render(<PredictAllBanner count={1} onStart={() => {}} />)
    expect(screen.getByText(/1 match to predict/)).toBeInTheDocument()
    expect(screen.queryByText(/1 matches/)).not.toBeInTheDocument()
  })

  it("renders nothing when count is 0", () => {
    const { container } = render(
      <PredictAllBanner count={0} onStart={() => {}} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("calls onStart when button is clicked", () => {
    const onStart = vi.fn()
    render(<PredictAllBanner count={3} onStart={onStart} />)
    fireEvent.click(screen.getByText("Start Predicting →"))
    expect(onStart).toHaveBeenCalledOnce()
  })
})
