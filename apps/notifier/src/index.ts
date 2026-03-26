import cron from "node-cron"
import { config } from "./config.js"
import { createDiscordClient } from "./discord.js"
import { runNotifications } from "./services/notification.service.js"

const main = async () => {
  const client = await createDiscordClient()
  console.log("Discord client ready")

  const cronExpression = `0 ${config.notificationHour} * * *`
  console.log(
    `Scheduling notifications at hour ${config.notificationHour} UTC daily (cron: ${cronExpression})`
  )

  cron.schedule(cronExpression, async () => {
    console.log("Running notification job…")
    try {
      await runNotifications(client)
      console.log("Notification job complete")
      if (config.uptimeKumaPushUrl) {
        try {
          await fetch(config.uptimeKumaPushUrl)
        } catch {
          console.error("⚠️ Failed to ping Uptime Kuma")
        }
      }
    } catch (err) {
      console.error("Notification job failed:", err)
    }
  })
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
