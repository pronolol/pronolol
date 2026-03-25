import { Client, GatewayIntentBits } from "discord.js"
import { config } from "./config.js"

export const createDiscordClient = async (): Promise<Client> => {
  const client = new Client({ intents: [GatewayIntentBits.DirectMessages] })
  await client.login(config.discordBotToken)
  return client
}
