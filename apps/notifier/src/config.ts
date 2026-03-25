import "dotenv/config"

const required = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export const config = {
  discordBotToken: required("DISCORD_BOT_TOKEN"),
  appUrl: process.env["APP_URL"] ?? "https://pronolol.fr",
  notificationHour: Number(process.env["NOTIFICATION_HOUR"] ?? "9"),
}
