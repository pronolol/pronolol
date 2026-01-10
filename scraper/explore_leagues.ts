import { chromium } from "playwright";
import * as fs from "fs";

async function exploreLeagues() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const capturedData: any[] = [];

  // Intercept all GraphQL API calls
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("/api/gql")) {
      try {
        const json = await response.json();
        capturedData.push({
          url: url.substring(0, 200),
          operationName: new URL(url).searchParams.get("operationName"),
          data: json,
        });
      } catch (e) {
        // Ignore
      }
    }
  });

  console.log("🌐 Navigating to lolesports.com...");
  await page.goto("https://lolesports.com/en-US/leagues", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(5000);

  // Try to find league links
  console.log("📋 Looking for league information...");

  // Click on different sections to trigger API calls
  try {
    await page.click("text=Schedule", { timeout: 2000 });
    await page.waitForTimeout(2000);
  } catch (e) {}

  try {
    await page.click("text=Standings", { timeout: 2000 });
    await page.waitForTimeout(2000);
  } catch (e) {}

  await browser.close();

  // Save captured data
  fs.writeFileSync(
    "explore_output.json",
    JSON.stringify(capturedData, null, 2)
  );

  console.log(`✅ Captured ${capturedData.length} API responses`);
  console.log("📁 Saved to explore_output.json");
}

exploreLeagues().catch(console.error);
