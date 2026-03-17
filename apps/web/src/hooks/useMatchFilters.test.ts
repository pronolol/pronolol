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
    it("starts with no leagues selected when preferences are empty", async () => {
      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.leagues.length).toBeGreaterThan(0)
      )
      expect(result.current.selectedLeagueIds).toEqual([])
    })

    it("restores saved leagueIds from server preferences", async () => {
      server.use(
        http.get(`${API_URL}/users/me/preferences`, () =>
          HttpResponse.json({ leagueIds: ["league-1", "league-2"] })
        )
      )

      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.selectedLeagueIds).toEqual([
          "league-1",
          "league-2",
        ])
      )
    })

    it("loads leagues from the API", async () => {
      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.leagues.length).toBeGreaterThan(0)
      )
      expect(result.current.leagues[0]).toMatchObject({
        id: "league-1",
        name: "LEC",
      })
    })
  })

  describe("toggleLeague", () => {
    it("adds a league id when it is not selected", async () => {
      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.leagues.length).toBeGreaterThan(0)
      )

      act(() => result.current.toggleLeague("league-1"))
      expect(result.current.selectedLeagueIds).toEqual(["league-1"])
    })

    it("removes a league id when it is already selected", async () => {
      server.use(
        http.get(`${API_URL}/users/me/preferences`, () =>
          HttpResponse.json({ leagueIds: ["league-1", "league-2"] })
        )
      )

      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.selectedLeagueIds).toEqual([
          "league-1",
          "league-2",
        ])
      )

      act(() => result.current.toggleLeague("league-1"))
      expect(result.current.selectedLeagueIds).toEqual(["league-2"])
    })

    it("allows multiple leagues to be selected simultaneously", async () => {
      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.leagues.length).toBeGreaterThan(0)
      )

      act(() => result.current.toggleLeague("league-1"))
      act(() => result.current.toggleLeague("league-2"))
      expect(result.current.selectedLeagueIds).toEqual(["league-1", "league-2"])
    })
  })

  describe("clearLeagues", () => {
    it("resets selectedLeagueIds to empty", async () => {
      server.use(
        http.get(`${API_URL}/users/me/preferences`, () =>
          HttpResponse.json({ leagueIds: ["league-1"] })
        )
      )

      const { result } = renderHook(() => useMatchFilters(), {
        wrapper: createWrapper(),
      })
      await waitFor(() =>
        expect(result.current.selectedLeagueIds).toEqual(["league-1"])
      )

      act(() => result.current.clearLeagues())
      expect(result.current.selectedLeagueIds).toEqual([])
    })
  })
})
