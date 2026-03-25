import type { Client } from "discord.js"
import { config } from "../config.js"

export const sendWelcomeDm = async (
  client: Client,
  discordUserId: string
): Promise<boolean> => {
  try {
    const user = await client.users.fetch(discordUserId)
    await user.send({
      embeds: [
        {
          title: "👋 Pronolol match reminders",
          description: [
            "We will send you a message the day before upcoming matches you haven't predicted yet.",
            "",
            `📋 **Set your league preferences** so we only notify you for the leagues you follow:\n👉 ${config.appUrl}/profile`,
            "",
            "You can also disable these reminders from your profile at any time.",
          ].join("\n"),
          color: 0x5865f2,
        },
      ],
    })
    return true
  } catch {
    return false
  }
}

export const sendReminderDm = async (
  client: Client,
  discordUserId: string,
  matchCount: number
): Promise<boolean> => {
  try {
    const user = await client.users.fetch(discordUserId)
    const matchWord = matchCount === 1 ? "match" : "matches"
    await user.send({
      embeds: [
        {
          title: `⚡ ${matchCount} ${matchWord} to predict tomorrow`,
          description: [
            `👉 **Predict now:** ${config.appUrl}/?wizard=true`,
            "",
            `⚙️ Notification settings: ${config.appUrl}/profile`,
          ].join("\n"),
          color: 0x5865f2,
        },
      ],
    })
    return true
  } catch {
    return false
  }
}
