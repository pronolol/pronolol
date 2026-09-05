import "dotenv/config"
import { prisma } from "@pronolol/database"
import {
  TARGET_DISCORD_LEAGUE_IDS,
  TARGET_DISCORD_LEAGUE_NAMES,
  TARGET_DISCORD_LEAGUE_SLUGS,
} from "../constants/discord.constants"
import { sendDailyMatchesWebhook } from "../services/discord.service"

export const getParisDayBounds = (date: Date = new Date()) => {
  // Format date in Paris timezone YYYY-MM-DD
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const parts = formatter.formatToParts(date)
  const year = parts.find((p) => p.type === "year")?.value
  const month = parts.find((p) => p.type === "month")?.value
  const day = parts.find((p) => p.type === "day")?.value

  // We construct boundary ISO string representation for start and end of Paris calendar day
  // Paris winter is UTC+1, summer is UTC+2.
  // Using Date parsing with timezone offset offset calculation:
  const startOfDay = new Date(`${year}-${month}-${day}T00:00:00.000+02:00`)
  const endOfDay = new Date(`${year}-${month}-${day}T23:59:59.999+02:00`)

  return { startOfDay, endOfDay }
}

export const runDailyDiscordNotification = async (): Promise<{
  matchCount: number
  sent: boolean
}> => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL is not set in environment. Skipping.")
    return { matchCount: 0, sent: false }
  }

  // Calculate Paris day start and end bounds
  const now = new Date()
  // Generate date range covering today in Paris time
  const parisTodayStr = now.toLocaleDateString("en-CA", {
    timeZone: "Europe/Paris",
  })
  const startOfDay = new Date(`${parisTodayStr}T00:00:00+02:00`)
  const endOfDay = new Date(`${parisTodayStr}T23:59:59+02:00`)

  console.log(
    `Querying matches between ${startOfDay.toISOString()} and ${endOfDay.toISOString()} (Paris date: ${parisTodayStr})...`
  )

  const matches = await prisma.match.findMany({
    where: {
      matchDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      tournament: {
        league: {
          OR: [
            { id: { in: TARGET_DISCORD_LEAGUE_IDS } },
            { id: { in: TARGET_DISCORD_LEAGUE_SLUGS, mode: "insensitive" } },
            { name: { in: TARGET_DISCORD_LEAGUE_NAMES, mode: "insensitive" } },
          ],
        },
      },
    },
    include: {
      teamA: { select: { name: true, tag: true, logoUrl: true } },
      teamB: { select: { name: true, tag: true, logoUrl: true } },
      tournament: {
        include: {
          league: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: {
      matchDate: "asc",
    },
  })

  console.log(
    `Found ${matches.length} matching matches for Discord notification.`
  )

  if (matches.length === 0) {
    console.log("No scheduled target matches for today. Exiting clean.")
    return { matchCount: 0, sent: false }
  }

  await sendDailyMatchesWebhook(matches, webhookUrl)
  console.log(
    `Successfully sent Discord match notification for ${matches.length} matches!`
  )
  return { matchCount: matches.length, sent: true }
}

const isDirectExecution =
  process.argv[1]?.endsWith("send-discord-notification.ts") ||
  process.argv[1]?.endsWith("send-discord-notification.js")

if (isDirectExecution) {
  runDailyDiscordNotification()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Fatal error in daily Discord notification script:", err)
      process.exit(1)
    })
}
