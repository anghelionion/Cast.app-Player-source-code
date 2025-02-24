const { defineConfig } = require("cypress");

module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: "https://pydcast.com/play/",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
  },
  fixturesFolder: false,
  numTestsKeptInMemory: 0,
  projectId: "qkjjkk",
  retries: {
    openMode: 0,
    runMode: 2,
  },
  videoUploadOnPasses: false,
  viewportHeight: 900,
  viewportWidth: 1600,
});
