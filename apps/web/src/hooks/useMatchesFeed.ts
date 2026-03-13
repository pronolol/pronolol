import { useInfiniteQuery } from "@tanstack/react-query"
import { AXIOS_INSTANCE } from "@/api/client"
import type { Match } from "@/api/generated/models"

type PageParam = { direction: string | null; cursor: string }

const PAGE_SIZE = 20

export function useMatchesFeed() {
  return useInfiniteQuery<
    Match[],
    Error,
    { pages: Match[][]; pageParams: PageParam[] },
    string[],
    PageParam
  >({
    queryKey: ["matchesFeed"],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      params.set("limit", String(PAGE_SIZE))

      if (pageParam.direction) {
        params.set("direction", pageParam.direction)
        if (pageParam.cursor) {
          params.set("cursor", pageParam.cursor)
        }
      } else {
        params.set("direction", "around")
        params.set("cursor", new Date().toISOString())
      }

      const response = await AXIOS_INSTANCE.get<Match[]>(`/matches?${params}`)
      return response.data
    },
    initialPageParam: { direction: null, cursor: "" },
    getNextPageParam: (lastPage): PageParam | undefined => {
      if (!lastPage || lastPage.length === 0 || lastPage.length < PAGE_SIZE) {
        return undefined
      }
      const lastMatch = lastPage[lastPage.length - 1]
      if (!lastMatch.matchDate) return undefined
      return { direction: "after", cursor: lastMatch.matchDate }
    },
    getPreviousPageParam: (firstPage): PageParam | undefined => {
      if (!firstPage || firstPage.length === 0 || firstPage.length < PAGE_SIZE) {
        return undefined
      }
      const firstMatch = firstPage[0]
      if (!firstMatch.matchDate) return undefined
      return { direction: "before", cursor: firstMatch.matchDate }
    },
  })
}
