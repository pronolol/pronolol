import "dotenv/config"
import { prisma } from "@pronolol/database"
import {
  TARGET_DISCORD_LEAGUE_IDS,
  TARGET_DISCORD_LEAGUE_NAMES,
  TARGET_DISCORD_LEAGUE_SLUGS,
} from "../constants/discord.constants"
import { sendDailyMatchesWebhook } from "../services/discord.service"

export const getRolling24HourBounds = (now: Date = new Date()) => {
  const start = new Date(now.getTime())
  const end = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
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

  const now = new Date()
  const { start: startOfWindow, end: endOfWindow } = getRolling24HourBounds(now)

  console.log(
    `Querying matches between ${startOfWindow.toISOString()} and ${endOfWindow.toISOString()}...`
  )

  const matches = await prisma.match.findMany({
    where: {
      matchDate: {
        gte: startOfWindow,
        lte: endOfWindow,
      },
      state: { not: "completed" },
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
  try {
    await runDailyDiscordNotification()
    process.exit(0)
  } catch (err) {
    console.error("Fatal error in daily Discord notification script:", err)
    process.exit(1)
  }
}
