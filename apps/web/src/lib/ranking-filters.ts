import type { RankingFilterLeague } from "@/api/generated/models"

export interface FilterOption {
  label: string
  value: string | null
}

export const buildLeagueOptions = (
  leagues: RankingFilterLeague[]
): FilterOption[] => [
  { label: "All Leagues", value: null },
  ...leagues.map((league) => ({ label: league.name, value: league.id })),
]

export const buildTournamentOptions = (
  leagues: RankingFilterLeague[],
  leagueId: string | null
): FilterOption[] => {
  const all: FilterOption = { label: "All Tournaments", value: null }

  if (leagueId) {
    const league = leagues.find((l) => l.id === leagueId)
    return [
      all,
      ...(league?.tournaments ?? []).map((t) => ({
        label: t.name,
        value: t.id,
      })),
    ]
  }

  // Tournament names (e.g. "Spring Split") repeat across leagues, so prefix
  // them with the league when every league is listed.
  return [
    all,
    ...leagues.flatMap((league) =>
      league.tournaments.map((t) => ({
        label: `${league.name} — ${t.name}`,
        value: t.id,
      }))
    ),
  ]
}
