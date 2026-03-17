import { useState, useEffect, useRef } from "react"
import {
  useGetUsersMePreferences,
  usePutUsersMePreferences,
} from "@/api/generated/users/users"
import { useGetLeagues } from "@/api/generated/leagues/leagues"
import type { LeagueWithTournaments } from "@/api/generated/models"

export type LeagueOption = LeagueWithTournaments

export const useMatchFilters = () => {
  const [selectedLeagueIds, setSelectedLeagueIds] = useState<string[]>([])
  const preferencesLoaded = useRef(false)

  const { data: preferences } = useGetUsersMePreferences()
  const { mutate: savePreferences } = usePutUsersMePreferences()
  const { data: leagues = [] } = useGetLeagues()

  // Restore preferences from server on first load
  useEffect(() => {
    if (preferences && !preferencesLoaded.current) {
      preferencesLoaded.current = true
      setSelectedLeagueIds(preferences.leagueIds)
    }
  }, [preferences])

  const toggleLeague = (leagueId: string) => {
    const next = selectedLeagueIds.includes(leagueId)
      ? selectedLeagueIds.filter((id) => id !== leagueId)
      : [...selectedLeagueIds, leagueId]
    setSelectedLeagueIds(next)
    savePreferences({ data: { leagueIds: next } })
  }

  const clearLeagues = () => {
    setSelectedLeagueIds([])
    savePreferences({ data: { leagueIds: [] } })
  }

  return {
    leagues,
    selectedLeagueIds,
    toggleLeague,
    clearLeagues,
  }
}
