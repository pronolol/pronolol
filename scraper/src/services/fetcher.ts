import { chromium, Browser, Page } from "playwright";
import { config } from "../config/scraper";

export class FetcherService {
  private browser: Browser | null = null;

  async init(): Promise<void> {
    if (!this.browser) {
      console.error("🌐 Launching browser...");
      this.browser = await chromium.launch({
        headless: config.playwright.headless,
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Navigates to the lolesports leagues page and intercepts all
   * GraphQL API calls, returning the raw data.
   * @param leagues - A list of league slugs to scrape.
   */
  async fetchData(leagues: string[]): Promise<{ [key: string]: any[] }> {
    await this.init();

    const page = await this.browser!.newPage();
    const allApiData: { [key: string]: any[] } = {};

    // Set up the response interceptor
    this.setupResponseInterceptor(page, allApiData);

    // Navigate and wait for network to be idle
    const leaguesParam = leagues.join(",");
    const url = `${config.baseUrl}/en-US/leagues/${leaguesParam}`;
    console.error(`🔗 Navigating to ${url}...`);

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: config.playwright.navigationTimeout,
    });

    // Attempt to load more matches
    await this.loadMore(page);

    await page.close();

    console.error(
      `   Operations captured: ${Object.keys(allApiData).join(", ")}`
    );
    return allApiData;
  }

  /**
   * Sets up a listener on the page to intercept and store GraphQL responses.
   */
  private setupResponseInterceptor(
    page: Page,
    storage: { [key: string]: any[] }
  ): void {
    page.on("response", async (response) => {
      const url = response.url();
      if (!url.includes("/api/gql")) return;

      const contentType = response.headers()["content-type"];
      if (!contentType || !contentType.includes("application/json")) return;

      try {
        const json = await response.json();
        const operationMatch = url.match(/operationName=([^&]+)/);
        const operationName = operationMatch ? operationMatch[1] : "unknown";

        console.error(`📡 Captured API response from: ${operationName}`);

        if (!storage[operationName]) {
          storage[operationName] = [];
        }
        storage[operationName].push(json);
      } catch (e) {
        console.error(
          `  ✗ Failed to parse JSON response from ${response.url()}: ${e}`
        );
      }
    });
  }

  /**
   * Clicks the "Load More" button if it's visible on the page.
   */
  private async loadMore(page: Page): Promise<void> {
    try {
      const loadMoreButton = page.locator(
        'button:has-text("Load more"), button:has-text("Charger plus")'
      );
      const isVisible = await loadMoreButton.isVisible({ timeout: 2000 });

      if (isVisible) {
        console.error("📥 Loading more matches...");
        await loadMoreButton.click();
        await page.waitForTimeout(config.playwright.loadMoreTimeout);
      }
    } catch (e) {
      // It's okay if the button isn't found, just means no more pages.
      console.error("   (No 'Load more' button found, continuing...)");
    }
  }
}
