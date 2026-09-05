export interface MatchForDiscordNotification {
  id: string
  matchDate: Date
  bestOf: number
  state: string
  teamA: { name: string; tag: string; logoUrl?: string }
  teamB: { name: string; tag: string; logoUrl?: string }
  tournament: {
    name: string
    league: { name: string; id: string }
  }
}

export interface DiscordEmbedField {
  name: string
  value: string
  inline?: boolean
}

export interface DiscordEmbed {
  title: string
  description?: string
  url?: string
  color?: number
  fields?: DiscordEmbedField[]
  footer?: { text: string }
  timestamp?: string
}

export interface DiscordComponent {
  type: 1 | 2
  style?: number // 5 for Link button
  label?: string
  url?: string
  components?: DiscordComponent[]
}

export interface DiscordWebhookPayload {
  content?: string
  embeds?: DiscordEmbed[]
  components?: DiscordComponent[]
}

const formatMatchTime = (date: Date): string => {
  const unixTimestamp = Math.floor(date.getTime() / 1000)
  return `<t:${unixTimestamp}:t>`
}

export const buildDiscordMatchPayload = (
  matches: MatchForDiscordNotification[]
): DiscordWebhookPayload => {
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  const matchesByTournament = matches.reduce((groups, match) => {
    const key = `${match.tournament.league.name}\u0000${match.tournament.name}`
    const tournamentMatches = groups.get(key) ?? []
    tournamentMatches.push(match)
    groups.set(key, tournamentMatches)
    return groups
  }, new Map<string, MatchForDiscordNotification[]>())

  const embeds: DiscordEmbed[] = Array.from(
    matchesByTournament.values(),
    (tournamentMatches) => {
      const { league, name } = tournamentMatches[0]!.tournament

      return {
        title: `${league.name} — ${name}`,
        description: tournamentMatches
          .map(
            (match) =>
              `${formatMatchTime(match.matchDate)} · ${match.teamA.name} (${match.teamA.tag}) vs ${match.teamB.name} (${match.teamB.tag}) · BO${match.bestOf}`
          )
          .join("\n"),
        color: 0x5865f2,
      }
    }
  )

  const components: DiscordComponent[] = [
    {
      type: 1, // Action Row
      components: [
        {
          type: 2, // Button
          style: 5, // Link style button
          label: "Faire mes pronostics",
          url: "https://pronolol.fr",
        },
      ],
    },
  ]

  return {
    content: `**Matchs du jour — ${capitalizedDate}**\nVoici les matchs programmés aujourd'hui. N'oubliez pas d'enregistrer vos pronostics avant le début des rencontres.`,
    embeds,
    components,
  }
}

export const sendDailyMatchesWebhook = async (
  matches: MatchForDiscordNotification[],
  webhookUrl: string
): Promise<void> => {
  if (!matches || matches.length === 0) {
    return
  }

  const payload = buildDiscordMatchPayload(matches)
  const webhookEndpoint = new globalThis.URL(webhookUrl)
  webhookEndpoint.searchParams.set("with_components", "true")

  try {
    const response = await fetch(webhookEndpoint.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Failed to send Discord webhook: ${response.status} ${response.statusText} - ${errorText}`
      )
    }
  } catch (error) {
    console.error("Error sending Discord match notification webhook:", error)
    throw error
  }
}
