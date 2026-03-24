import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth-context"
import { useGetRanking } from "@/api/generated/rankings/rankings"
import {
  useGetUsersMePreferences,
  usePutUsersMePreferences,
  getGetUsersMePreferencesQueryKey,
} from "@/api/generated/users/users"
import { useGetLeagues } from "@/api/generated/leagues/leagues"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const StatTile = ({
  label,
  value,
}: {
  label: string
  value: string | number
}) => (
  <div className="bg-background-secondary rounded-xl p-3 text-center">
    <p className="text-lg font-bold text-text-primary">{value}</p>
    <p className="text-xs text-text-secondary mt-0.5">{label}</p>
  </div>
)

export const ProfilePage = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: rankingData, isLoading: rankingLoading } = useGetRanking()
  const { data: preferencesData, isLoading: prefsLoading } =
    useGetUsersMePreferences()
  const { data: leaguesData, isLoading: leaguesLoading } = useGetLeagues()
  const updatePreferences = usePutUsersMePreferences()

  const [pendingLeagueIds, setPendingLeagueIds] = useState<string[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (preferencesData?.leagueIds) {
      setPendingLeagueIds(preferencesData.leagueIds)
    }
  }, [preferencesData?.leagueIds])

  const displayName =
    user?.displayUsername || user?.username || user?.name || "User"

  const myStats =
    rankingData?.rankings.find((r) => r.userId === user?.id) ?? null

  const isDirty =
    JSON.stringify([...pendingLeagueIds].sort()) !==
    JSON.stringify([...(preferencesData?.leagueIds ?? [])].sort())

  const handleLeagueToggle = (leagueId: string) => {
    setPendingLeagueIds((prev) =>
      prev.includes(leagueId)
        ? prev.filter((id) => id !== leagueId)
        : [...prev, leagueId]
    )
  }

  const handleSave = async () => {
    setSaveError(null)
    try {
      await updatePreferences.mutateAsync({ data: { leagueIds: pendingLeagueIds } })
      queryClient.invalidateQueries({
        queryKey: getGetUsersMePreferencesQueryKey(),
      })
    } catch {
      setSaveError("Failed to save preferences")
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Identity */}
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <Avatar src={user?.image} name={displayName} size="lg" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-base text-text-primary">
              {displayName}
            </p>
            <p className="text-sm text-text-secondary">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
        </CardHeader>
        <CardContent>
          {rankingLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Rank" value={myStats ? `#${myStats.rank}` : "—"} />
              <StatTile
                label="Points"
                value={myStats ? myStats.totalPoints : "—"}
              />
              <StatTile
                label="Accuracy"
                value={myStats ? `${myStats.correctnessPercentage}%` : "—"}
              />
              <StatTile
                label="Exact picks"
                value={myStats ? myStats.exactPredictions : "—"}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* League preferences */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Leagues</CardTitle>
          <Button
            size="sm"
            variant="outline"
            disabled={!isDirty || updatePreferences.isPending}
            loading={updatePreferences.isPending}
            onClick={handleSave}
          >
            Save
          </Button>
        </CardHeader>
        <CardContent>
          {leaguesLoading || prefsLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {leaguesData?.map((league) => {
                const isSelected = pendingLeagueIds.includes(league.id)
                return (
                  <li key={league.id}>
                    <button
                      onClick={() => handleLeagueToggle(league.id)}
                      className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 border transition-colors text-left ${
                        isSelected
                          ? "border-primary bg-primary-light"
                          : "border-border bg-background-secondary hover:border-primary/40"
                      }`}
                    >
                      <img
                        src={league.imageUrl}
                        alt={league.name}
                        className="w-6 h-6 rounded-full object-contain"
                      />
                      <span className="text-sm font-medium text-text-primary flex-1">
                        {league.name}
                      </span>
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-primary shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {saveError && (
            <p className="text-sm text-red-500 mt-3">{saveError}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
