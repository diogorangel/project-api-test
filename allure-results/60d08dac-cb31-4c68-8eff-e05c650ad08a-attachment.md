# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: users.spec.ts >> API - User Management Workflow (Carrefour) >> Scenario 5: Should update user information successfully
- Location: tests\users.spec.ts:88:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 201
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import path from 'path';
  3   | import process from 'process';
  4   | import fs from 'fs';
  5   | 
  6   | const baseURL = 'https://serverest.dev';
  7   | 
  8   | // Variáveis globais para armazenar os dados de estado entre os testes
  9   | let authToken = '';
  10  | let userId = '';
  11  | let uniqueEmail = `qa_${Date.now()}@carrefour.com`;
  12  | 
  13  | // Usei .serial para garantir que os testes rodem em ordem, pois dependem um do outro
  14  | test.describe.serial('API - User Management Workflow (Carrefour)', () => {
  15  | 
  16  |     // ==========================================
  17  |     // --- POSITIVE TESTS (Happy Path) ---
  18  |     // ==========================================
  19  | 
  20  |     test('Scenario 1: Should create a user successfully with all valid fields', async ({ request }, testInfo) => {
  21  |         const testName = testInfo.title.replace(/[\s:]+/g, '_');
  22  |         const evidenceDir = path.join(process.cwd(), 'evidence', testName);
  23  |         if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });
  24  | 
  25  |         const response = await request.post(`${baseURL}/usuarios`, {
  26  |             data: {
  27  |                 nome: "Fulano Silva",
  28  |                 email: uniqueEmail,
  29  |                 password: "senha_segura",
  30  |                 administrador: "true"
  31  |             }
  32  |         });
  33  | 
  34  |         expect(response.status()).toBe(201);
  35  |         const body = await response.json();
  36  |         
  37  |         fs.writeFileSync(path.join(evidenceDir, 'response.json'), JSON.stringify(body, null, 2));
  38  | 
  39  |         expect(body.message).toBe("Cadastro realizado com sucesso");
  40  |         expect(body).toHaveProperty('_id');
  41  |         
  42  |         // Salvando o ID para os próximos cenários
  43  |         userId = body._id;
  44  |     });
  45  | 
  46  |     test('Scenario 2: Should authenticate user and generate JWT token', async ({ request }, testInfo) => {
  47  |         const testName = testInfo.title.replace(/[\s:]+/g, '_');
  48  |         const evidenceDir = path.join(process.cwd(), 'evidence', testName);
  49  |         if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });
  50  | 
  51  |         const response = await request.post(`${baseURL}/login`, {
  52  |             data: {
  53  |                 email: uniqueEmail,
  54  |                 password: "senha_segura"
  55  |             }
  56  |         });
  57  | 
  58  |         expect(response.status()).toBe(200);
  59  |         const body = await response.json();
  60  |         
  61  |         fs.writeFileSync(path.join(evidenceDir, 'response.json'), JSON.stringify(body, null, 2));
  62  | 
  63  |         expect(body.message).toBe("Login realizado com sucesso");
  64  |         expect(body).toHaveProperty('authorization');
  65  |         
  66  |         // Salvando o Token JWT para os próximos cenários
  67  |         authToken = body.authorization;
  68  |     });
  69  | 
  70  |     test('Scenario 3: Should return a list of all users', async ({ request }, testInfo) => {
  71  |         const testName = testInfo.title.replace(/[\s:]+/g, '_');
  72  |         const response = await request.get(`${baseURL}/usuarios`);
  73  |         expect(response.status()).toBe(200);
  74  |         
  75  |         const body = await response.json();
  76  |         expect(Array.isArray(body.usuarios)).toBeTruthy();
  77  |     });
  78  | 
  79  |     test('Scenario 4: Should return details of a specific user by ID', async ({ request }, testInfo) => {
  80  |         const testName = testInfo.title.replace(/[\s:]+/g, '_');
  81  |         const response = await request.get(`${baseURL}/usuarios/${userId}`);
  82  |         expect(response.status()).toBe(200);
  83  |         
  84  |         const body = await response.json();
  85  |         expect(body.email).toBe(uniqueEmail);
  86  |     });
  87  | 
  88  |     test('Scenario 5: Should update user information successfully', async ({ request }, testInfo) => {
  89  |         const testName = testInfo.title.replace(/[\s:]+/g, '_');
  90  |         const response = await request.put(`${baseURL}/usuarios/${userId}`, {
  91  |             headers: { 'Authorization': authToken },
  92  |             data: {
  93  |                 nome: "Fulano Silva Atualizado",
  94  |                 email: uniqueEmail,
  95  |                 password: "nova_senha_segura",
  96  |                 administrador: "true"
  97  |             }
  98  |         });
  99  | 
> 100 |         expect(response.status()).toBe(200);
      |                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  101 |         const body = await response.json();
  102 |         expect(body.message).toBe('Registro alterado com sucesso');
  103 |     });
  104 | 
  105 |     test('Scenario 6: Should delete the created user successfully', async ({ request }, testInfo) => {
  106 |         const testName = testInfo.title.replace(/[\s:]+/g, '_');
  107 |         const response = await request.delete(`${baseURL}/usuarios/${userId}`, {
  108 |             headers: { 'Authorization': authToken }
  109 |         });
  110 | 
  111 |         expect(response.status()).toBe(200);
  112 |         const body = await response.json();
  113 |         expect(body.message).toBe('Registro excluído com sucesso');
  114 |     });
  115 | 
  116 |     // ==========================================
  117 |     // --- NEGATIVE TESTS & EDGE CASES ---
  118 |     // ==========================================
  119 | 
  120 |     test('Scenario 7: Should not create a user when a mandatory field is missing', async ({ request }, testInfo) => {
  121 |         const testName = testInfo.title.replace(/[\s:]+/g, '_');
  122 |         const response = await request.post(`${baseURL}/usuarios`, {
  123 |             data: {
  124 |                 nome: "Ana Silva",
  125 |                 email: `ana_${Date.now()}@teste.com`,
  126 |                 // eu omiti o password de propósito
  127 |                 administrador: "true"
  128 |             }
  129 |         });
  130 | 
  131 |         expect(response.status()).toBe(400); 
  132 |         const body = await response.json();
  133 |         expect(body.password).toBe("password é obrigatório");
  134 |     });
  135 | 
  136 |     // ==========================================
  137 |     // --- RATE LIMITING TEST ---
  138 |     // ==========================================
  139 | 
  140 |     test('Scenario 8: Should return status 429 when exceeding the limit of 100 requests per minute', async ({ request }, testInfo) => {
  141 |         const testName = testInfo.title.replace(/[\s:]+/g, '_');
  142 |         // Indica ao Playwright que sabemos que este teste vai falhar devido a uma limitação da API mock (ServeRest)
  143 |         test.fail(true, 'BUG: A API ServeRest não implementa o Rate Limit de 100 req/min exigido no requisito.');
  144 | 
  145 |         const TOTAL_REQUESTS = 105; 
  146 |         const requestPromises = [];
  147 | 
  148 |         // Eu preparei aqui as 105 chamadas simultâneas
  149 |         for (let i = 0; i < TOTAL_REQUESTS; i++) {
  150 |             requestPromises.push(request.get(`${baseURL}/usuarios`));
  151 |         }
  152 | 
  153 |         // Eu faço disparar todas de uma vez para forçar o limite de taxa
  154 |         const responses = await Promise.all(requestPromises);
  155 | 
  156 |         // Eu Mapeio os status codes
  157 |         const statusCodes = responses.map(res => res.status());
  158 | 
  159 |         //Eu Valido se houve bloqueio (Rate Limit)
  160 |         const containsRateLimitError = statusCodes.includes(429);
  161 | 
  162 |         expect(
  163 |             containsRateLimitError, 
  164 |             'The API should return 429 Too Many Requests when exceeding 100 req/min'
  165 |         ).toBeTruthy();
  166 |     });
  167 | 
  168 |     test('Scenario 9: Validate the message different of password é obrigatório nao é aceito', async ({ request }, testInfo) => {
  169 |         const testName = testInfo.title.replace(/[\s:]+/g, '_');
  170 |         const response = await request.post(`${baseURL}/usuarios`, {
  171 |             data: {
  172 |                 nome: "Ana Silva",
  173 |                 email: `ana_${Date.now()}@teste.com`,
  174 |                 // eu omiti o password de propósito
  175 |                 administrador: "true"
  176 |             }
  177 |         });
  178 | 
  179 |         expect(response.status()).toBe(400); 
  180 |         const body = await response.json();
  181 |         // Validação do que esta certo
  182 |         expect(body.password).toBe("password é obrigatório");
  183 |         // Validação do que esta errado
  184 |         expect(body.password).not.toBe("password não pode ficar em branco");
  185 |     });
  186 |     test('Scenario 10: Should return details of a specific user by ID verification 2', async ({ request }, testInfo) => {
  187 |     // 1. Setup: Create a user explicitly for this specific test
  188 |     const testEmail = `qa_details_${Date.now()}@carrefour.com`;
  189 |     const setupResponse = await request.post(`${baseURL}/usuarios`, {
  190 |         data: {
  191 |             nome: "Fulano Detalhes",
  192 |             email: testEmail,
  193 |             password: "senha_segura",
  194 |             administrador: "true"
  195 |         }
  196 |     });
  197 |     
  198 |     // Ensure setup was successful before proceeding
  199 |     expect(setupResponse.status()).toBe(201); 
  200 |     const setupBody = await setupResponse.json();
```