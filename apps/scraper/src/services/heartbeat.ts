export type HeartbeatStatus = "up" | "down"

const MAX_MSG_LENGTH = 200

/**
 * Build an Uptime Kuma push URL. The URL copied from Kuma usually already
 * contains `?status=up&msg=OK&ping=`, so status and msg are overridden.
 */
export const buildPushUrl = (
  pushUrl: string,
  status: HeartbeatStatus,
  msg: string
): string => {
  const url = new URL(pushUrl)
  url.searchParams.set("status", status)
  url.searchParams.set("msg", msg.slice(0, MAX_MSG_LENGTH))
  return url.toString()
}

/**
 * Report the result of a scrape run to an Uptime Kuma push monitor.
 * Never throws: monitoring must not break the scraper.
 */
export const sendHeartbeat = async (
  status: HeartbeatStatus,
  msg: string,
  pushUrl: string | undefined = process.env.UPTIME_KUMA_PUSH_URL
): Promise<void> => {
  if (!pushUrl) return

  try {
    const res = await fetch(buildPushUrl(pushUrl, status, msg))
    if (!res.ok) {
      console.error(`⚠️ Uptime Kuma push answered ${res.status}`)
    }
  } catch {
    console.error("⚠️ Failed to ping Uptime Kuma")
  }
}
