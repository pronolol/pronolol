import { describe, it, expect } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import { server } from "@/test/mocks/server"
import { useMatchesFeed } from "./useMatchesFeed"

const API_URL = "http://localhost:3000"
const PAGE_SIZE = 20

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    )
  }
}

const makeMatch = (id: string, matchDate: string) => ({
  id,
  matchDate,
  state: "upcoming",
  bestOf: 3,
  stage: null,
  teamAScore: null,
  teamBScore: null,
  winner: null,
  teamA: { id: "team-a", name: "Team A", tag: "TLA", logoUrl: "" },
  teamB: { id: "team-b", name: "Team B", tag: "TLB", logoUrl: "" },
  tournament: {
    id: "t1",
    name: "Spring",
    league: { id: "l1", name: "LEC", imageUrl: "" },
  },
})

const makeMatches = (count: number) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.now() + i * 60_000)
    return makeMatch(`match-${i}`, d.toISOString())
  })

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useMatchesFeed", () => {
  describe("hasNextPage after initial around load", () => {
    it("is true when the initial page has fewer than PAGE_SIZE items", async () => {
      // The default MSW handler returns 1 match, well below PAGE_SIZE=20.
      // Before the fix, getNextPageParam would see 1 < 20 and return undefined.
      // After the fix, direction===null skips the size guard → hasNextPage stays true.
      const { result } = renderHook(() => useMatchesFeed(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.data?.pages[0]).toHaveLength(1)
      expect(result.current.hasNextPage).toBe(true)
    })

    it("becomes false once a subsequent after-page returns fewer than PAGE_SIZE items", async () => {
      // First call (direction=around): full page → hasNextPage true
      // Second call (direction=after): short page → hasNextPage false
      server.use(
        http.get(`${API_URL}/matches`, ({ request }) => {
          const direction = new URL(request.url).searchParams.get("direction")
          return HttpResponse.json(
            makeMatches(direction === "around" ? PAGE_SIZE : 10)
          )
        })
      )

      const { result } = renderHook(() => useMatchesFeed(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.hasNextPage).toBe(true)

      await result.current.fetchNextPage()
      await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false))

      expect(result.current.hasNextPage).toBe(false)
    })

    it("remains true when the after-page is a full page", async () => {
      server.use(
        http.get(`${API_URL}/matches`, () =>
          HttpResponse.json(makeMatches(PAGE_SIZE))
        )
      )

      const { result } = renderHook(() => useMatchesFeed(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await result.current.fetchNextPage()
      await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false))

      expect(result.current.hasNextPage).toBe(true)
    })
  })

  describe("hasPreviousPage after initial around load", () => {
    it("is true when the initial page has fewer than PAGE_SIZE items", async () => {
      // Same reasoning as hasNextPage: the initial around page may be short
      // without implying there are no past matches to load.
      const { result } = renderHook(() => useMatchesFeed(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.hasPreviousPage).toBe(true)
    })

    it("becomes false once a before-page returns fewer than PAGE_SIZE items", async () => {
      server.use(
        http.get(`${API_URL}/matches`, ({ request }) => {
          const direction = new URL(request.url).searchParams.get("direction")
          return HttpResponse.json(
            makeMatches(direction === "before" ? 5 : PAGE_SIZE)
          )
        })
      )

      const { result } = renderHook(() => useMatchesFeed(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.hasPreviousPage).toBe(true)

      await result.current.fetchPreviousPage()
      await waitFor(() =>
        expect(result.current.isFetchingPreviousPage).toBe(false)
      )

      expect(result.current.hasPreviousPage).toBe(false)
    })
  })

  describe("cursor values", () => {
    it("sends the last match date as cursor when fetching the next page", async () => {
      const lastDate = new Date(Date.now() + 999 * 60_000).toISOString()
      const matches = [
        ...makeMatches(PAGE_SIZE - 1),
        makeMatch("last", lastDate),
      ]

      let capturedCursor: string | null = null

      server.use(
        http.get(`${API_URL}/matches`, ({ request }) => {
          const url = new URL(request.url)
          const direction = url.searchParams.get("direction")
          if (direction === "after") {
            capturedCursor = url.searchParams.get("cursor")
          }
          return HttpResponse.json(direction === "after" ? [] : matches)
        })
      )

      const { result } = renderHook(() => useMatchesFeed(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await result.current.fetchNextPage()
      await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false))

      expect(capturedCursor).toBe(lastDate)
    })
  })
})
