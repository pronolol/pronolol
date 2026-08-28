import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  buildDiscordMatchPayload,
  sendDailyMatchesWebhook,
  MatchForDiscordNotification,
} from "./discord.service"

describe("discord.service", () => {
  const mockMatches: MatchForDiscordNotification[] = [
    {
      id: "match-1",
      matchDate: new Date("2026-08-29T16:00:00Z"),
      bestOf: 3,
      state: "unstarted",
      teamA: { name: "Fnatic", tag: "FNC" },
      teamB: { name: "G2 Esports", tag: "G2" },
      tournament: {
        name: "LEC Summer 2026",
        league: { id: "lec", name: "LEC" },
      },
    },
  ]

  describe("buildDiscordMatchPayload", () => {
    it("formats match details into a Discord webhook payload with embed and button link", () => {
      const payload = buildDiscordMatchPayload(
        mockMatches,
        "https://pronolol.app/matches"
      )

      expect(payload.content).toContain("Matchs du jour")
      expect(payload.embeds).toHaveLength(1)
      expect(payload.embeds?.[0].title).toBe("Fnatic (FNC) vs G2 Esports (G2)")
      expect(payload.embeds?.[0].fields).toContainEqual({
        name: "Format",
        value: "BO3",
        inline: true,
      })
      expect(payload.components).toHaveLength(1)
    })
  })

  describe("sendDailyMatchesWebhook", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn())
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it("does nothing if matches array is empty", async () => {
      await sendDailyMatchesWebhook(
        [],
        "https://discord.com/api/webhooks/123/abc",
        "https://pronolol.app"
      )
      expect(fetch).not.toHaveBeenCalled()
    })

    it("sends HTTP POST request to webhook URL when matches exist", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
      })
      vi.stubGlobal("fetch", mockFetch)

      await sendDailyMatchesWebhook(
        mockMatches,
        "https://discord.com/api/webhooks/123/abc",
        "https://pronolol.app"
      )

      expect(mockFetch).toHaveBeenCalledWith(
        "https://discord.com/api/webhooks/123/abc",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      )
    })

    it("throws error when fetch response is not ok", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: vi.fn().mockResolvedValue("Invalid Payload"),
      })
      vi.stubGlobal("fetch", mockFetch)

      await expect(
        sendDailyMatchesWebhook(
          mockMatches,
          "https://discord.com/api/webhooks/123/abc",
          "https://pronolol.app"
        )
      ).rejects.toThrow("Failed to send Discord webhook: 400 Bad Request")
    })
  })
})
