const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'https://serverest.dev', // Utilizando a API sugerida
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
});