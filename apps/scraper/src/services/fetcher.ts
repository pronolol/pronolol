import { chromium, Browser, Page } from "playwright";
import { config } from "../config/scraper";
import { Event } from "../types";

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
  async fetchData(leagues: string[]): Promise<{ [key: string]: Event[] }> {
    await this.init();

    const page = await this.browser!.newPage();
    const allApiData: { [key: string]: any[] } = {};
    const responsePromises: Promise<void>[] = [];

    // Set up the response interceptor
    this.setupResponseInterceptor(page, allApiData, responsePromises);

    // Navigate and wait for network to be idle
    const leaguesParam = leagues.join(",");
    const url = `${config.baseUrl}/en-GB/leagues/${leaguesParam}`;
    console.error(`🔗 Navigating to ${url}...`);

    await page.goto(url, {
      timeout: config.playwright.navigationTimeout,
    });

    // Attempt to load more matches
    await this.loadMore(page);

    await Promise.all(responsePromises);
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
    storage: { [key: string]: any[] },
    responsePromises: Promise<void>[]
  ): void {
    page.on("response", async (response) => {
      const url = response.url();
      if (!url.includes("/api/gql")) return;

      const contentType = response.headers()["content-type"];
      if (!contentType || !contentType.includes("application/json")) return;

      const promise = (async () => {
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
      })();
      responsePromises.push(promise);
    });
  }

  /**
   * Clicks the "Load More" button if it's visible on the page.
   */
  private async loadMore(page: Page): Promise<void> {
    console.error("🔄 Checking for 'Load more' button...");
    try {
      const loadMoreButtons = await page.getByText("Load more").all();

      if (loadMoreButtons.length === 0) {
        console.error("   (No 'Load more' button found, continuing...)");
        return;
      }
      for (const button of loadMoreButtons) {
        if (await button.isVisible()) {
          console.error("   'Load more' button found, clicking...");
          await button.click();
          console.error(
            "   Clicked 'Load more' button, waiting for content..."
          );
          await page.waitForTimeout(config.playwright.loadMoreTimeout);
        }
      }
    } catch (e) {
      // It's okay if the button isn't found, just means no more pages.
      console.error("   (No 'Load more' button found, continuing...)");
    }
    console.error("✅ 'Load more' check complete.");
  }
}
