module.exports = {
  projectId: "o95veb",
  testingType: "e2e",
  e2e: {
    baseUrl: 'http://localhost:8080', // Set the base URL for your application
    specPattern: './cypress/integration/**/*.cy.{js,jsx,ts,tsx}', // Specify the pattern for test spec files
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
};
