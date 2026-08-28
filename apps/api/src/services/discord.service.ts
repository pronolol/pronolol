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
  type: number // 1 for Action Row, 2 for Button
  style?: number // 5 for Link button
  label?: string
  url?: string
}

export interface DiscordWebhookPayload {
  content?: string
  embeds?: DiscordEmbed[]
  components?: DiscordComponent[]
}

const formatMatchTime = (date: Date): string => {
  const formattedTime = date.toLocaleTimeString("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
  })
  const unixTimestamp = Math.floor(date.getTime() / 1000)
  return `${formattedTime} (Paris) / <t:${unixTimestamp}:t>`
}

export const buildDiscordMatchPayload = (
  matches: MatchForDiscordNotification[],
  predictionUrl: string
): DiscordWebhookPayload => {
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  const embeds: DiscordEmbed[] = matches.map((match) => {
    const timeText = formatMatchTime(match.matchDate)
    const vsTitle = `${match.teamA.name} (${match.teamA.tag}) vs ${match.teamB.name} (${match.teamB.tag})`

    return {
      title: vsTitle,
      color: 0x5865f2, // Discord Blurple
      fields: [
        {
          name: "League / Tournament",
          value: `${match.tournament.league.name} - ${match.tournament.name}`,
          inline: true,
        },
        {
          name: "Format",
          value: `BO${match.bestOf}`,
          inline: true,
        },
        {
          name: "Horaire",
          value: timeText,
          inline: false,
        },
      ],
    }
  })

  const components: DiscordComponent[] = [
    {
      type: 1, // Action Row
      components: [
        {
          type: 2, // Button
          style: 5, // Link style button
          label: "Faire mes pronostics 🎯",
          url: predictionUrl,
        },
      ],
    } as unknown as DiscordComponent,
  ]

  return {
    content: `⚔️ **Matchs du jour — ${capitalizedDate}**\nVoici les matchs programmés aujourd'hui ! N'oubliez pas d'enregistrer vos pronostics avant le début des rencontres.`,
    embeds,
    components,
  }
}

export const sendDailyMatchesWebhook = async (
  matches: MatchForDiscordNotification[],
  webhookUrl: string,
  frontendUrl: string
): Promise<void> => {
  if (!matches || matches.length === 0) {
    return
  }

  const predictionUrl = frontendUrl.endsWith("/")
    ? `${frontendUrl}matches`
    : `${frontendUrl}/matches`

  const payload = buildDiscordMatchPayload(matches, predictionUrl)

  try {
    const response = await fetch(webhookUrl, {
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
