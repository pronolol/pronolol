export const config = {
  defaultLeagues: ["first_stand", "lec", "msi", "worlds", "lck"],

  baseUrl: "https://lolesports.com",

  playwright: {
    headless: true,
    navigationTimeout: 60000, // 60 seconds
    loadMoreTimeout: 5000, // 5 seconds to wait after clicking "load more"
  },
};
