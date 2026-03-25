import { useState, useEffect, useRef } from "react"
import { useGetUsersMePreferences } from "@/api/generated/users/users"
import { useGetLeagues } from "@/api/generated/leagues/leagues"
import type { LeagueWithTournaments } from "@/api/generated/models"

export type LeagueOption = LeagueWithTournaments

export const useMatchFilters = () => {
  const [selectedLeagueIds, setSelectedLeagueIds] = useState<string[]>([])
  const preferencesLoaded = useRef(false)

  const { data: preferences } = useGetUsersMePreferences()
  const { data: leagues = [] } = useGetLeagues()

  // Restore preferences from server on first load
  useEffect(() => {
    if (preferences && !preferencesLoaded.current) {
      preferencesLoaded.current = true
      setSelectedLeagueIds(preferences.leagueIds)
    }
  }, [preferences])

  const toggleLeague = (leagueId: string) => {
    setSelectedLeagueIds((prev) =>
      prev.includes(leagueId)
        ? prev.filter((id) => id !== leagueId)
        : [...prev, leagueId]
    )
  }

  const clearLeagues = () => {
    setSelectedLeagueIds([])
  }

  return {
    leagues,
    selectedLeagueIds,
    toggleLeague,
    clearLeagues,
  }
}
