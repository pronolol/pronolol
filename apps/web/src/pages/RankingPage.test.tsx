import { vi, describe, it, expect } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse, delay } from "msw"
import { server } from "@/test/mocks/server"
import { renderWithProviders } from "@/test/utils"
import { RankingPage } from "./RankingPage"

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: "user-1" },
    isLoading: false,
    isAuthenticated: true,
  }),
}))

const API_URL = "http://localhost:3000"

const makeEntry = (userId: string, displayName: string, rank: number) => ({
  userId,
  rank,
  displayName,
  username: null,
  image: null,
  totalPoints: 100 - rank,
  totalPredictions: 10,
  correctPredictions: 5,
  exactPredictions: 1,
  correctnessPercentage: 50,
})

const getOptionLabels = (select: HTMLElement) =>
  within(select)
    .getAllByRole("option")
    .map((o) => o.textContent)

const waitForFilters = async () => {
  const leagueSelect = screen.getByRole("combobox", { name: "League" })
  await waitFor(() => expect(getOptionLabels(leagueSelect)).toContain("LEC"))
  return {
    leagueSelect,
    tournamentSelect: screen.getByRole("combobox", { name: "Tournament" }),
  }
}

describe("RankingPage", () => {
  it("populates the selectors from the ranking filters endpoint", async () => {
    renderWithProviders(<RankingPage />)
    const { leagueSelect, tournamentSelect } = await waitForFilters()

    expect(getOptionLabels(leagueSelect)).toEqual(["All Leagues", "LCK", "LEC"])
    expect(getOptionLabels(tournamentSelect)).toEqual([
      "All Tournaments",
      "LCK — Spring Split",
      "LEC — Summer Split",
      "LEC — Spring Split",
    ])
  })

  it("narrows tournaments to the selected league and sends the filter", async () => {
    const requests: URL[] = []
    server.use(
      http.get(`${API_URL}/ranking`, ({ request }) => {
        requests.push(new URL(request.url))
        return HttpResponse.json({
          rankings: [makeEntry("user-1", "Alice", 1)],
          filters: { leagueId: null, tournamentId: null },
        })
      })
    )
    const user = userEvent.setup()
    renderWithProviders(<RankingPage />)
    const { leagueSelect, tournamentSelect } = await waitForFilters()

    await user.selectOptions(leagueSelect, "league-1")

    expect(getOptionLabels(tournamentSelect)).toEqual([
      "All Tournaments",
      "Summer Split",
      "Spring Split",
    ])
    await waitFor(() =>
      expect(
        requests.some((u) => u.searchParams.get("leagueId") === "league-1")
      ).toBe(true)
    )
  })

  it("resets the tournament when the league changes", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RankingPage />)
    const { leagueSelect, tournamentSelect } = await waitForFilters()

    await user.selectOptions(tournamentSelect, "tournament-3")
    expect(tournamentSelect).toHaveValue("tournament-3")

    await user.selectOptions(leagueSelect, "league-1")
    expect(tournamentSelect).toHaveValue("")
  })

  it("keeps the selectors and previous rankings visible while refetching", async () => {
    server.use(
      http.get(`${API_URL}/ranking`, async ({ request }) => {
        const leagueId = new URL(request.url).searchParams.get("leagueId")
        if (leagueId) await delay("infinite")
        return HttpResponse.json({
          rankings: [makeEntry("user-1", "Alice", 1)],
          filters: { leagueId: null, tournamentId: null },
        })
      })
    )
    const user = userEvent.setup()
    renderWithProviders(<RankingPage />)
    const { leagueSelect } = await waitForFilters()
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument())

    await user.selectOptions(leagueSelect, "league-1")

    expect(screen.getByRole("combobox", { name: "League" })).toHaveValue(
      "league-1"
    )
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.queryByTestId("ranking-skeleton")).not.toBeInTheDocument()
  })

  it("still renders the selectors when there are no scored predictions", async () => {
    server.use(
      http.get(`${API_URL}/ranking/filters`, () => HttpResponse.json([]))
    )
    renderWithProviders(<RankingPage />)

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument())
    expect(
      getOptionLabels(screen.getByRole("combobox", { name: "League" }))
    ).toEqual(["All Leagues"])
  })
})
