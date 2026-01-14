export const config = {
  defaultLeagues: ["first_stand", "lec", "msi", "worlds"],

  baseUrl: "https://lolesports.com",

  playwright: {
    headless: true,
    navigationTimeout: 60000, // 60 seconds
    loadMoreTimeout: 5000, // 5 seconds to wait after clicking "load more"
  },

  // Mapping of league slugs to their region
  regionMap: {
    lec: "Europe",
    lcs: "North America",
    lck: "Korea",
    lpl: "China",
    worlds: "International",
    msi: "International",
    first_stand: "International",
    pcs: "Pacific",
    vcs: "Vietnam",
    cblol: "Brazil",
    lla: "Latin America",
    ljl: "Japan",
    tco: "Turkey",
  },
};
