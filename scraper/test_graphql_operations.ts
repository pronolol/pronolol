import * as fs from "fs";

interface GraphQLRequest {
  operationName: string;
  persistedQueryHash: string;
  variables: any;
  description: string;
}

const operations: GraphQLRequest[] = [
  {
    operationName: "homeLeagues",
    persistedQueryHash:
      "47a15b362554c95b9b0cc3789e59661bc87ed6e5c6d5738712a409e384457c5e",
    variables: {
      hl: "en-US",
      sport: ["lol"],
      flags: ["excludeHidden", "excludeWithoutTournaments"],
    },
    description:
      "Fetch all leagues with their tournaments - may contain tournament dates",
  },
  {
    operationName: "GetGprSeasons",
    persistedQueryHash:
      "c749e5ac23bd1614867cd86a8fc0eefec4b448bd986b2614e1ed7f85dfa2107f",
    variables: {
      hl: "en-US",
      sport: "lol",
    },
    description:
      "Fetch Global Power Rankings seasons - may contain season dates",
  },
  {
    operationName: "GetSeasonForNavigation",
    persistedQueryHash:
      "0d48d1f4929890f9b75b7e0d4306a6031b541316545b49ef7b8ddbeabe230e87",
    variables: {
      hl: "en-US",
      seasonId: "115547545029543948",
    },
    description: "Fetch specific season data - may contain tournament schedule",
  },
];

async function testOperation(op: GraphQLRequest): Promise<void> {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`Testing: ${op.operationName}`);
  console.log(`Description: ${op.description}`);
  console.log(`${"=".repeat(80)}\n`);

  const variables = encodeURIComponent(JSON.stringify(op.variables));
  const extensions = encodeURIComponent(
    JSON.stringify({
      persistedQuery: {
        version: 1,
        sha256Hash: op.persistedQueryHash,
      },
    })
  );

  const url = `https://lolesports.com/api/gql?operationName=${op.operationName}&variables=${variables}&extensions=${extensions}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://lolesports.com/",
        Origin: "https://lolesports.com",
      },
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(`Response body: ${text.substring(0, 200)}`);
      return;
    }

    const data = await response.json();

    // Save full response to file
    const filename = `test_${op.operationName}_response.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`✅ Response saved to: ${filename}`);

    // Check for dates in the response
    const responseStr = JSON.stringify(data);
    const hasStartDate = responseStr.includes("startDate");
    const hasEndDate = responseStr.includes("endDate");
    const hasDates = responseStr.includes('"date"');

    console.log(`\n📊 Date Fields Found:`);
    console.log(`  - startDate: ${hasStartDate ? "✓" : "✗"}`);
    console.log(`  - endDate: ${hasEndDate ? "✓" : "✗"}`);
    console.log(`  - date: ${hasDates ? "✓" : "✗"}`);

    // Look for tournament structure
    const hasTournaments = responseStr.includes("tournament");
    const hasSeasons = responseStr.includes("season");
    const hasSplit = responseStr.includes("split");

    console.log(`\n🏆 Structure Found:`);
    console.log(`  - tournaments: ${hasTournaments ? "✓" : "✗"}`);
    console.log(`  - seasons: ${hasSeasons ? "✓" : "✗"}`);
    console.log(`  - split: ${hasSplit ? "✓" : "✗"}`);
  } catch (error) {
    console.error(
      `❌ Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function main() {
  console.log(
    "🔍 Testing GraphQL Operations for Tournament Date Information\n"
  );

  for (const operation of operations) {
    await testOperation(operation);
    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ All tests complete!");
  console.log("Check the generated JSON files for full responses.");
  console.log("=".repeat(80));
}

main();
