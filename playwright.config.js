const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  
  
  reporter: [
    ['line'],                                                 // Para mostrar os resultados no terminal
    ['html', { open: 'never' }],                              // Para gerar o relatório padrão (necessário para o show-report)
    ['allure-playwright', { outputFolder: 'allure-results' }] // Para gerar os dados para o Allure
  ],

  use: {
    baseURL: 'https://serverest.dev',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
});