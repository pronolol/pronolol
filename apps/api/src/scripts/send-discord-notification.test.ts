import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@pronolol/database", () => ({
  prisma: {
    match: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock("../services/discord.service", () => ({
  sendDailyMatchesWebhook: vi.fn(),
}))

import { prisma } from "@pronolol/database"
import { sendDailyMatchesWebhook } from "../services/discord.service"
import { runDailyDiscordNotification } from "./send-discord-notification"

describe("send-discord-notification script", () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetAllMocks()
    process.env = {
      ...originalEnv,
      DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/test",
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("returns early without sending when DISCORD_WEBHOOK_URL is not set", async () => {
    delete process.env.DISCORD_WEBHOOK_URL
    const result = await runDailyDiscordNotification()

    expect(result).toEqual({ matchCount: 0, sent: false })
    expect(prisma.match.findMany).not.toHaveBeenCalled()
  })

  it("queries matches and sends webhook when matches are found", async () => {
    const mockMatches = [
      {
        id: "m1",
        matchDate: new Date(),
        bestOf: 3,
        state: "unstarted",
        teamA: { name: "Fnatic", tag: "FNC" },
        teamB: { name: "G2 Esports", tag: "G2" },
        tournament: {
          name: "LEC Summer",
          league: { id: "lec", name: "LEC" },
        },
      },
    ]

    vi.mocked(prisma.match.findMany).mockResolvedValueOnce(
      mockMatches as unknown as Awaited<
        ReturnType<typeof prisma.match.findMany>
      >
    )

    const result = await runDailyDiscordNotification()

    expect(result).toEqual({ matchCount: 1, sent: true })
    expect(prisma.match.findMany).toHaveBeenCalledTimes(1)
    expect(sendDailyMatchesWebhook).toHaveBeenCalledWith(
      mockMatches,
      "https://discord.com/api/webhooks/test"
    )
  })

  it("exits gracefully without calling webhook when zero matches match query", async () => {
    vi.mocked(prisma.match.findMany).mockResolvedValueOnce([])

    const result = await runDailyDiscordNotification()

    expect(result).toEqual({ matchCount: 0, sent: false })
    expect(sendDailyMatchesWebhook).not.toHaveBeenCalled()
  })
})
