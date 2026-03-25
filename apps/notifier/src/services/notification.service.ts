import type { Client } from "discord.js"
import { prisma } from "@pronolol/database"
import { sendWelcomeDm, sendReminderDm } from "./discord-dm.service.js"

const startOfDay = (date: Date): Date => {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

const endOfDay = (date: Date): Date => {
  const d = new Date(date)
  d.setUTCHours(23, 59, 59, 999)
  return d
}

const isSameUTCDay = (a: Date, b: Date): boolean =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate()

export const sendWelcomeNotifications = async (client: Client) => {
  const usersToWelcome = await prisma.user.findMany({
    where: {
      accounts: { some: { providerId: "discord" } },
      preferences: { discordWelcomeNotified: false },
    },
    include: {
      accounts: { where: { providerId: "discord" } },
      preferences: true,
    },
  })

  for (const user of usersToWelcome) {
    const discordAccount = user.accounts[0]
    if (!discordAccount) continue

    const sent = await sendWelcomeDm(client, discordAccount.accountId)
    if (sent) {
      await prisma.userPreferences.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          leagueIds: [],
          discordWelcomeNotified: true,
        },
        update: { discordWelcomeNotified: true },
      })
    }
  }
}

export const sendDailyReminders = async (client: Client) => {
  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

  const tomorrowStart = startOfDay(tomorrow)
  const tomorrowEnd = endOfDay(tomorrow)

  const today = new Date()

  const eligibleUsers = await prisma.user.findMany({
    where: {
      accounts: { some: { providerId: "discord" } },
      preferences: {
        discordNotificationsEnabled: true,
        discordWelcomeNotified: true,
      },
    },
    include: {
      accounts: { where: { providerId: "discord" } },
      preferences: true,
      predictions: {
        where: {
          match: {
            matchDate: { gte: tomorrowStart, lte: tomorrowEnd },
            state: "upcoming",
          },
        },
        select: { matchId: true },
      },
    },
  })

  for (const user of eligibleUsers) {
    const prefs = user.preferences
    if (!prefs) continue

    // Skip if already notified today
    if (
      prefs.lastNotificationSentAt &&
      isSameUTCDay(prefs.lastNotificationSentAt, today)
    ) {
      continue
    }

    const discordAccount = user.accounts[0]
    if (!discordAccount) continue

    // Find unpredicted upcoming matches tomorrow in the user's preferred leagues
    const predictedMatchIds = new Set(user.predictions.map((p) => p.matchId))

    const upcomingMatches = await prisma.match.findMany({
      where: {
        matchDate: { gte: tomorrowStart, lte: tomorrowEnd },
        state: "upcoming",
        ...(prefs.leagueIds.length > 0 && {
          tournament: { leagueId: { in: prefs.leagueIds } },
        }),
      },
      select: { id: true },
    })

    const unpredictedMatches = upcomingMatches.filter(
      (m) => !predictedMatchIds.has(m.id)
    )

    if (unpredictedMatches.length === 0) continue

    const sent = await sendReminderDm(
      client,
      discordAccount.accountId,
      unpredictedMatches.length
    )

    if (sent) {
      await prisma.userPreferences.update({
        where: { userId: user.id },
        data: { lastNotificationSentAt: today },
      })
    }
  }
}

export const runNotifications = async (client: Client) => {
  await sendWelcomeNotifications(client)
  await sendDailyReminders(client)
}
