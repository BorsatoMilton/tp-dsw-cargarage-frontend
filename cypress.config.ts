import { defineConfig } from "cypress";

export default defineConfig({
  chromeWebSecurity: false,
  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
      options: {
        projectConfig: {
          root: "",
          sourceRoot: "src",
          buildOptions: {
            tsConfig: "cypress/tsconfig.json",
          },
        },
      },
    },
    specPattern: "**/*.cy.ts",
  },

  e2e: {
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
