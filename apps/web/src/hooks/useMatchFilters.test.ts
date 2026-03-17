import { describe, it, expect } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import { server } from "@/test/mocks/server"
import { useMatchFilters } from "./useMatchFilters"

const API_URL = "http://localhost:3000"

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe("useMatchFilters", () => {
  describe("initial state", () => {
    it("starts with no league or tournament selected when preferences are null", async () => {
      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.leagues.length).toBeGreaterThan(0)
      )
      expect(result.current.selectedLeagueId).toBeNull()
      expect(result.current.selectedTournamentId).toBeNull()
    })

    it("restores saved league and tournament from server preferences", async () => {
      server.use(
        http.get(`${API_URL}/users/me/preferences`, () =>
          HttpResponse.json({
            leagueId: "league-1",
            tournamentId: "tournament-1",
          })
        )
      )

      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.selectedLeagueId).toBe("league-1")
      )
      expect(result.current.selectedTournamentId).toBe("tournament-1")
    })

    it("loads leagues from the API", async () => {
      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.leagues.length).toBeGreaterThan(0)
      )
      expect(result.current.leagues[0]).toMatchObject({ id: "league-1", name: "LEC" })
    })
  })

  describe("setLeague", () => {
    it("updates selectedLeagueId and clears selectedTournamentId", async () => {
      server.use(
        http.get(`${API_URL}/users/me/preferences`, () =>
          HttpResponse.json({
            leagueId: "league-1",
            tournamentId: "tournament-1",
          })
        )
      )

      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.selectedTournamentId).toBe("tournament-1")
      )

      act(() => result.current.setLeague("league-2"))
      expect(result.current.selectedLeagueId).toBe("league-2")
      expect(result.current.selectedTournamentId).toBeNull()
    })

    it("clears selectedLeagueId when called with null", async () => {
      server.use(
        http.get(`${API_URL}/users/me/preferences`, () =>
          HttpResponse.json({ leagueId: "league-1", tournamentId: null })
        )
      )

      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.selectedLeagueId).toBe("league-1")
      )

      act(() => result.current.setLeague(null))
      expect(result.current.selectedLeagueId).toBeNull()
    })
  })

  describe("setTournament", () => {
    it("updates selectedTournamentId", async () => {
      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.leagues.length).toBeGreaterThan(0)
      )

      act(() => result.current.setTournament("tournament-2"))
      expect(result.current.selectedTournamentId).toBe("tournament-2")
    })

    it("clears selectedTournamentId when called with null", async () => {
      server.use(
        http.get(`${API_URL}/users/me/preferences`, () =>
          HttpResponse.json({ leagueId: "league-1", tournamentId: "tournament-1" })
        )
      )

      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.selectedTournamentId).toBe("tournament-1")
      )

      act(() => result.current.setTournament(null))
      expect(result.current.selectedTournamentId).toBeNull()
    })
  })

  describe("tournaments", () => {
    it("returns tournaments for the selected league", async () => {
      server.use(
        http.get(`${API_URL}/users/me/preferences`, () =>
          HttpResponse.json({ leagueId: "league-1", tournamentId: null })
        )
      )

      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.selectedLeagueId).toBe("league-1")
      )
      await waitFor(() =>
        expect(result.current.leagues.length).toBeGreaterThan(0)
      )

      expect(result.current.tournaments).toEqual([
        { id: "tournament-1", name: "Spring Split" },
        { id: "tournament-2", name: "Summer Split" },
      ])
    })

    it("returns an empty array when no league is selected", async () => {
      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.leagues.length).toBeGreaterThan(0)
      )
      expect(result.current.tournaments).toEqual([])
    })
  })
})
