import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { buildPushUrl, sendHeartbeat } from "./heartbeat"

const PUSH_URL =
  "https://kuma.example.com/api/push/abc123?status=up&msg=OK&ping="

const makeResponse = (ok = true): Response =>
  ({ ok, status: ok ? 200 : 404 }) as Response

describe("buildPushUrl", () => {
  it("overrides status and msg from the URL copied out of Uptime Kuma", () => {
    const url = new URL(buildPushUrl(PUSH_URL, "down", "DB unreachable"))

    expect(url.origin + url.pathname).toBe(
      "https://kuma.example.com/api/push/abc123"
    )
    expect(url.searchParams.get("status")).toBe("down")
    expect(url.searchParams.get("msg")).toBe("DB unreachable")
  })

  it("works with a bare push URL without query params", () => {
    const url = new URL(
      buildPushUrl("https://kuma.example.com/api/push/abc123", "up", "OK")
    )

    expect(url.searchParams.get("status")).toBe("up")
    expect(url.searchParams.get("msg")).toBe("OK")
  })

  it("truncates very long messages", () => {
    const url = new URL(buildPushUrl(PUSH_URL, "down", "x".repeat(1000)))

    expect(url.searchParams.get("msg")).toHaveLength(200)
  })
})

describe("sendHeartbeat", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("does nothing when no push URL is configured", async () => {
    await sendHeartbeat("up", "OK", undefined)

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("pings the push URL with the given status", async () => {
    fetchMock.mockResolvedValue(makeResponse())

    await sendHeartbeat("up", "OK", PUSH_URL)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const called = new URL(fetchMock.mock.calls[0][0] as string)
    expect(called.searchParams.get("status")).toBe("up")
  })

  it("never throws when the request fails", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"))

    await expect(sendHeartbeat("up", "OK", PUSH_URL)).resolves.toBeUndefined()
  })

  it("logs when Uptime Kuma answers with an error status", async () => {
    fetchMock.mockResolvedValue(makeResponse(false))

    await sendHeartbeat("up", "OK", PUSH_URL)

    expect(console.error).toHaveBeenCalled()
  })
})
