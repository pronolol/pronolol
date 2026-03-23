import { describe, it, expect } from "vitest"
import { screen, waitFor, fireEvent } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/mocks/server"
import { renderWithProviders } from "@/test/utils"
import { MatchesFeed } from "./MatchesFeed"

const API_URL = "http://localhost:3000"
const PAGE_SIZE = 20

const makeMatch = (id: string, matchDate: string) => ({
  id,
  matchDate,
  state: "upcoming",
  bestOf: 3,
  stage: null,
  teamAScore: null,
  teamBScore: null,
  winner: null,
  teamA: { id: "team-a", name: "Team Alpha", tag: "TLA", logoUrl: "" },
  teamB: { id: "team-b", name: "Team Beta", tag: "TLB", logoUrl: "" },
  tournament: {
    id: "t1",
    name: "Spring Split",
    league: { id: "l1", name: "LEC", imageUrl: "" },
  },
  myPrediction: null,
})

const futureDate = () => new Date(Date.now() + 60 * 60_000).toISOString()

describe("MatchesFeed", () => {
  describe("Load More buttons", () => {
    it("shows both buttons after initial load when more pages exist", async () => {
      // Default handler returns 1 match with direction=around (size guard skipped)
      // → both hasPreviousPage and hasNextPage are true
      renderWithProviders(<MatchesFeed />)

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Load more matches" })
        ).toBeInTheDocument()
      )
      expect(
        screen.getByRole("button", { name: "Load earlier matches" })
      ).toBeInTheDocument()
    })

    it("fetches next page when Load more is clicked", async () => {
      let nextPageRequested = false

      server.use(
        http.get(`${API_URL}/matches`, ({ request }) => {
          const direction = new URL(request.url).searchParams.get("direction")
          if (direction === "after") nextPageRequested = true
          return HttpResponse.json([makeMatch("m1", futureDate())])
        })
      )

      renderWithProviders(<MatchesFeed />)

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Load more matches" })
        ).toBeInTheDocument()
      )
      fireEvent.click(screen.getByRole("button", { name: "Load more matches" }))

      await waitFor(() => expect(nextPageRequested).toBe(true))
    })

    it("fetches previous page when Load earlier is clicked", async () => {
      let prevPageRequested = false

      server.use(
        http.get(`${API_URL}/matches`, ({ request }) => {
          const direction = new URL(request.url).searchParams.get("direction")
          if (direction === "before") prevPageRequested = true
          return HttpResponse.json([makeMatch("m1", futureDate())])
        })
      )

      renderWithProviders(<MatchesFeed />)

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Load earlier matches" })
        ).toBeInTheDocument()
      )
      fireEvent.click(
        screen.getByRole("button", { name: "Load earlier matches" })
      )

      await waitFor(() => expect(prevPageRequested).toBe(true))
    })

    it("hides Load more button when no next page remains", async () => {
      server.use(
        http.get(`${API_URL}/matches`, ({ request }) => {
          const direction = new URL(request.url).searchParams.get("direction")
          // After-page returns empty → hasNextPage becomes false
          return HttpResponse.json(
            direction === "after" ? [] : [makeMatch("m1", futureDate())]
          )
        })
      )

      renderWithProviders(<MatchesFeed />)

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Load more matches" })
        ).toBeInTheDocument()
      )
      fireEvent.click(screen.getByRole("button", { name: "Load more matches" }))

      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "Load more matches" })
        ).not.toBeInTheDocument()
      )
    })

    it("hides Load earlier button when no previous page remains", async () => {
      server.use(
        http.get(`${API_URL}/matches`, ({ request }) => {
          const direction = new URL(request.url).searchParams.get("direction")
          // Before-page returns empty → hasPreviousPage becomes false
          return HttpResponse.json(
            direction === "before" ? [] : [makeMatch("m1", futureDate())]
          )
        })
      )

      renderWithProviders(<MatchesFeed />)

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Load earlier matches" })
        ).toBeInTheDocument()
      )
      fireEvent.click(
        screen.getByRole("button", { name: "Load earlier matches" })
      )

      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "Load earlier matches" })
        ).not.toBeInTheDocument()
      )
    })
  })

  describe("PredictAllBanner in sticky area", () => {
    it("shows prediction banner when unpredicted matches exist", async () => {
      server.use(
        http.get(`${API_URL}/matches`, () =>
          HttpResponse.json([makeMatch("m1", futureDate())])
        )
      )

      renderWithProviders(<MatchesFeed />)

      await waitFor(() =>
        expect(screen.getByText(/match.*to predict/i)).toBeInTheDocument()
      )
    })

    it("does not show prediction banner when all matches are predicted", async () => {
      const predictedMatch = {
        ...makeMatch("m1", futureDate()),
        myPrediction: {
          id: "pred-1",
          teamId: "team-a",
          predictedTeamAScore: 2,
          predictedTeamBScore: 0,
          isCorrect: null,
          isExact: null,
          team: { id: "team-a", name: "Team Alpha", tag: "TLA", logoUrl: "" },
        },
      }

      server.use(
        http.get(`${API_URL}/matches`, () =>
          HttpResponse.json([predictedMatch])
        )
      )

      renderWithProviders(<MatchesFeed />)

      // Wait for matches to load first
      await waitFor(() => expect(screen.getByText("TLA")).toBeInTheDocument())

      expect(screen.queryByText(/match.*to predict/i)).not.toBeInTheDocument()
    })
  })
})
