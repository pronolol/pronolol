import { argosScreenshot } from "@argos-ci/playwright"
import { test, type Page } from "@playwright/test"

const API_URL = "http://localhost:3000"

const mockSession = {
  user: {
    id: "user-1",
    email: "alice@example.com",
    name: "Alice",
    image: null,
    username: "alice",
    displayUsername: "alice",
  },
  session: {
    id: "session-1",
    userId: "user-1",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
}

const mockMatches = [
  {
    id: "match-1",
    matchDate: new Date().toISOString(),
    state: "upcoming",
    bestOf: 3,
    teamAScore: null,
    teamBScore: null,
    teamA: { id: "team-a", name: "Team Alpha", tag: "TLA", logoUrl: null },
    teamB: { id: "team-b", name: "Team Beta", tag: "TLB", logoUrl: null },
    tournament: {
      id: "tournament-1",
      name: "Spring Split",
      league: { id: "league-1", name: "LEC" },
    },
    myPrediction: null,
  },
]

const mockRanking = {
  rankings: [
    {
      userId: "user-1",
      rank: 1,
      displayName: "Alice",
      image: null,
      totalPoints: 150,
      totalPredictions: 20,
      correctPredictions: 15,
      exactPredictions: 5,
      correctnessPercentage: 75,
    },
    {
      userId: "user-2",
      rank: 2,
      displayName: "Bob",
      image: null,
      totalPoints: 100,
      totalPredictions: 18,
      correctPredictions: 10,
      exactPredictions: 3,
      correctnessPercentage: 55,
    },
  ],
}

const setupApiMocks = async (page: Page) => {
  // Use URL function predicates so query params don't break matching
  await page.route(
    (url) => url.href.startsWith(`${API_URL}/auth/get-session`),
    (route) => route.fulfill({ json: mockSession })
  )
  await page.route(
    (url) => url.origin === API_URL && url.pathname === "/matches",
    (route) => route.fulfill({ json: mockMatches })
  )
  await page.route(
    (url) => url.origin === API_URL && /^\/matches\/[^/]+$/.test(url.pathname),
    (route) => route.fulfill({ json: { ...mockMatches[0], id: "match-1" } })
  )
  await page.route(
    (url) => url.origin === API_URL && url.pathname.endsWith("/predictions"),
    (route) => route.fulfill({ json: { myPrediction: null, predictions: [] } })
  )
  await page.route(
    (url) => url.origin === API_URL && url.pathname === "/ranking",
    (route) => route.fulfill({ json: mockRanking })
  )
  await page.route(
    (url) => url.origin === API_URL && url.pathname === "/leagues",
    (route) => route.fulfill({ json: [] })
  )
  await page.route(
    (url) => url.origin === API_URL && url.pathname === "/users/me/preferences",
    (route) => route.fulfill({ json: { leagueIds: [] } })
  )
}

test("sign-in page", async ({ page }) => {
  await page.goto("/sign-in")
  await argosScreenshot(page, "sign-in")
})

test("sign-up page", async ({ page }) => {
  await page.goto("/sign-up")
  await argosScreenshot(page, "sign-up")
})

test("home page", async ({ page }) => {
  await setupApiMocks(page)
  await page.goto("/")
  // Wait for at least one match card to be visible before screenshotting
  await page.waitForSelector("text=TLA", { timeout: 10000 })
  await argosScreenshot(page, "home")
})

test("match detail page", async ({ page }) => {
  await setupApiMocks(page)
  await page.goto("/matches/match-1")
  // Wait for league name to confirm match data loaded
  await page.waitForSelector("text=LEC", { timeout: 10000 })
  await argosScreenshot(page, "match-detail")
})

test("ranking page", async ({ page }) => {
  await setupApiMocks(page)
  await page.goto("/ranking")
  // Wait for ranking table content to be visible
  await page.waitForSelector("text=Alice", { timeout: 10000 })
  await argosScreenshot(page, "ranking")
})
