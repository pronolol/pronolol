import { vi, describe, it, expect, beforeEach } from "vitest"
import type { Client } from "discord.js"
import {
  sendWelcomeNotifications,
  sendDailyReminders,
} from "./notification.service"

// --- mock database ---
const mockUserFindMany = vi.fn()
const mockMatchFindMany = vi.fn()
const mockPrefsUpsert = vi.fn()
const mockPrefsUpdate = vi.fn()

vi.mock("@pronolol/database", () => ({
  prisma: {
    user: { findMany: (...args: unknown[]) => mockUserFindMany(...args) },
    match: { findMany: (...args: unknown[]) => mockMatchFindMany(...args) },
    userPreferences: {
      upsert: (...args: unknown[]) => mockPrefsUpsert(...args),
      update: (...args: unknown[]) => mockPrefsUpdate(...args),
    },
  },
}))

// --- mock DM service ---
const mockSendWelcomeDm = vi.fn()
const mockSendReminderDm = vi.fn()

vi.mock("./discord-dm.service.js", () => ({
  sendWelcomeDm: (...args: unknown[]) => mockSendWelcomeDm(...args),
  sendReminderDm: (...args: unknown[]) => mockSendReminderDm(...args),
}))

const mockClient = {} as Client

const makeUser = (
  id: string,
  discordId: string,
  overrides: Record<string, unknown> = {}
) => ({
  id,
  accounts: [{ providerId: "discord", accountId: discordId }],
  preferences: {
    leagueIds: [],
    discordNotificationsEnabled: true,
    discordWelcomeNotified: true,
    lastNotificationSentAt: null,
    ...overrides,
  },
  predictions: [],
})

describe("sendWelcomeNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendWelcomeDm.mockResolvedValue(true)
    mockPrefsUpsert.mockResolvedValue({})
  })

  it("sends welcome DM and marks user as notified", async () => {
    mockUserFindMany.mockResolvedValueOnce([
      makeUser("u1", "discord-111", { discordWelcomeNotified: false }),
    ])

    await sendWelcomeNotifications(mockClient)

    expect(mockSendWelcomeDm).toHaveBeenCalledWith(mockClient, "discord-111")
    expect(mockPrefsUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ discordWelcomeNotified: true }),
      })
    )
  })

  it("does not mark user if DM fails", async () => {
    mockSendWelcomeDm.mockResolvedValueOnce(false)
    mockUserFindMany.mockResolvedValueOnce([
      makeUser("u1", "discord-111", { discordWelcomeNotified: false }),
    ])

    await sendWelcomeNotifications(mockClient)

    expect(mockPrefsUpsert).not.toHaveBeenCalled()
  })

  it("skips users with no Discord account", async () => {
    mockUserFindMany.mockResolvedValueOnce([
      {
        id: "u1",
        accounts: [],
        preferences: { discordWelcomeNotified: false },
      },
    ])

    await sendWelcomeNotifications(mockClient)

    expect(mockSendWelcomeDm).not.toHaveBeenCalled()
  })
})

describe("sendDailyReminders", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendReminderDm.mockResolvedValue(true)
    mockPrefsUpdate.mockResolvedValue({})
  })

  it("sends reminder when unpredicted matches exist for tomorrow", async () => {
    mockUserFindMany.mockResolvedValueOnce([makeUser("u1", "discord-222")])
    mockMatchFindMany.mockResolvedValueOnce([{ id: "m1" }, { id: "m2" }])

    await sendDailyReminders(mockClient)

    expect(mockSendReminderDm).toHaveBeenCalledWith(
      mockClient,
      "discord-222",
      2
    )
    expect(mockPrefsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "u1" },
        data: expect.objectContaining({
          lastNotificationSentAt: expect.any(Date),
        }),
      })
    )
  })

  it("skips when all matches are already predicted", async () => {
    const user = makeUser("u1", "discord-222")
    user.predictions = [{ matchId: "m1" }]
    mockUserFindMany.mockResolvedValueOnce([user])
    mockMatchFindMany.mockResolvedValueOnce([{ id: "m1" }])

    await sendDailyReminders(mockClient)

    expect(mockSendReminderDm).not.toHaveBeenCalled()
  })

  it("skips when no matches tomorrow", async () => {
    mockUserFindMany.mockResolvedValueOnce([makeUser("u1", "discord-222")])
    mockMatchFindMany.mockResolvedValueOnce([])

    await sendDailyReminders(mockClient)

    expect(mockSendReminderDm).not.toHaveBeenCalled()
  })

  it("skips user already notified today", async () => {
    const user = makeUser("u1", "discord-222", {
      lastNotificationSentAt: new Date(),
    })
    mockUserFindMany.mockResolvedValueOnce([user])

    await sendDailyReminders(mockClient)

    expect(mockMatchFindMany).not.toHaveBeenCalled()
    expect(mockSendReminderDm).not.toHaveBeenCalled()
  })

  it("does not update prefs if DM send fails", async () => {
    mockSendReminderDm.mockResolvedValueOnce(false)
    mockUserFindMany.mockResolvedValueOnce([makeUser("u1", "discord-222")])
    mockMatchFindMany.mockResolvedValueOnce([{ id: "m1" }])

    await sendDailyReminders(mockClient)

    expect(mockPrefsUpdate).not.toHaveBeenCalled()
  })
})
