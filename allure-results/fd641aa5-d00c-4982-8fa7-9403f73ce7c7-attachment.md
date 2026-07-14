# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: users.spec.ts >> API - User Management Workflow (Carrefour) >> Scenario 1: Should create a user successfully with all valid fields
- Location: tests\users.spec.ts:20:9

# Error details

```
Error: ENOENT: no such file or directory, mkdir 'C:\Users\doeg\Projetos\project-api-test\evidence\Scenario_1:_Should_create_a_user_successfully_with_all_valid_fields'
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
  21  |         const testName = testInfo.title.replace(/\s+/g, '_');
  22  |         const evidenceDir = path.join(process.cwd(), 'evidence', testName);
> 23  |         if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });
      |                                             ^ Error: ENOENT: no such file or directory, mkdir 'C:\Users\doeg\Projetos\project-api-test\evidence\Scenario_1:_Should_create_a_user_successfully_with_all_valid_fields'
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
  47  |         const testName = testInfo.title.replace(/\s+/g, '_');
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
  70  |     test('Scenario 3: Should return a list of all users', async ({ request }) => {
  71  |         const response = await request.get(`${baseURL}/usuarios`);
  72  |         expect(response.status()).toBe(200);
  73  |         
  74  |         const body = await response.json();
  75  |         expect(Array.isArray(body.usuarios)).toBeTruthy();
  76  |     });
  77  | 
  78  |     test('Scenario 4: Should return details of a specific user by ID', async ({ request }) => {
  79  |         const response = await request.get(`${baseURL}/usuarios/${userId}`);
  80  |         expect(response.status()).toBe(200);
  81  |         
  82  |         const body = await response.json();
  83  |         expect(body.email).toBe(uniqueEmail);
  84  |     });
  85  | 
  86  |     test('Scenario 5: Should update user information successfully', async ({ request }) => {
  87  |         const response = await request.put(`${baseURL}/usuarios/${userId}`, {
  88  |             headers: { 'Authorization': authToken },
  89  |             data: {
  90  |                 nome: "Fulano Silva Atualizado",
  91  |                 email: uniqueEmail,
  92  |                 password: "nova_senha_segura",
  93  |                 administrador: "true"
  94  |             }
  95  |         });
  96  | 
  97  |         expect(response.status()).toBe(200);
  98  |         const body = await response.json();
  99  |         expect(body.message).toBe('Registro alterado com sucesso');
  100 |     });
  101 | 
  102 |     test('Scenario 6: Should delete the created user successfully', async ({ request }) => {
  103 |         const response = await request.delete(`${baseURL}/usuarios/${userId}`, {
  104 |             headers: { 'Authorization': authToken }
  105 |         });
  106 | 
  107 |         expect(response.status()).toBe(200);
  108 |         const body = await response.json();
  109 |         expect(body.message).toBe('Registro excluído com sucesso');
  110 |     });
  111 | 
  112 |     // ==========================================
  113 |     // --- NEGATIVE TESTS & EDGE CASES ---
  114 |     // ==========================================
  115 | 
  116 |     test('Scenario 7: Should not create a user when a mandatory field is missing', async ({ request }) => {
  117 |         const response = await request.post(`${baseURL}/usuarios`, {
  118 |             data: {
  119 |                 nome: "Ana Silva",
  120 |                 email: `ana_${Date.now()}@teste.com`,
  121 |                 // password omitido de propósito
  122 |                 administrador: "true"
  123 |             }
```