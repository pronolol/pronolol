import { useState, useEffect, useRef } from "react"
import {
  useGetUsersMePreferences,
  usePutUsersMePreferences,
} from "@/api/generated/users/users"
import { useGetLeagues } from "@/api/generated/leagues/leagues"
import type { LeagueWithTournaments } from "@/api/generated/models"

export type TournamentOption = { id: string; name: string }
export type LeagueOption = LeagueWithTournaments

export const useMatchFilters = () => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null)
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    string | null
  >(null)
  const preferencesLoaded = useRef(false)

  const { data: preferences } = useGetUsersMePreferences()
  const { mutate: savePreferences } = usePutUsersMePreferences()
  const { data: leagues = [] } = useGetLeagues()

  // Restore preferences from server on first load
  useEffect(() => {
    if (preferences && !preferencesLoaded.current) {
      preferencesLoaded.current = true
      setSelectedLeagueId(preferences.leagueId)
      setSelectedTournamentId(preferences.tournamentId)
    }
  }, [preferences])

  const selectedLeague = leagues.find((l) => l.id === selectedLeagueId) ?? null
  const tournaments: TournamentOption[] = selectedLeague
    ? selectedLeague.tournaments
    : []

  const setLeague = (leagueId: string | null) => {
    setSelectedLeagueId(leagueId)
    setSelectedTournamentId(null)
    savePreferences({ data: { leagueId, tournamentId: null } })
  }

  const setTournament = (tournamentId: string | null) => {
    setSelectedTournamentId(tournamentId)
    savePreferences({
      data: { leagueId: selectedLeagueId, tournamentId },
    })
  }

  return {
    leagues,
    tournaments,
    selectedLeagueId,
    selectedTournamentId,
    setLeague,
    setTournament,
  }
}
