# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: users.spec.ts >> API - User Management Workflow (Carrefour) >> Scenario 8: Should return status 429 when exceeding the limit of 100 requests per minute
- Location: tests\users.spec.ts:135:9

# Error details

```
Error: The API should return 429 Too Many Requests when exceeding 100 req/min

expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
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
  121 |                 // eu omiti o password de propósito
  122 |                 administrador: "true"
  123 |             }
  124 |         });
  125 | 
  126 |         expect(response.status()).toBe(400); 
  127 |         const body = await response.json();
  128 |         expect(body.password).toBe("password é obrigatório");
  129 |     });
  130 | 
  131 |     // ==========================================
  132 |     // --- RATE LIMITING TEST ---
  133 |     // ==========================================
  134 | 
  135 |     test('Scenario 8: Should return status 429 when exceeding the limit of 100 requests per minute', async ({ request }) => {
  136 |         // Indica ao Playwright que sabemos que este teste vai falhar devido a uma limitação da API mock (ServeRest)
  137 |         test.fail(true, 'BUG: A API ServeRest não implementa o Rate Limit de 100 req/min exigido no requisito.');
  138 | 
  139 |         const TOTAL_REQUESTS = 105; 
  140 |         const requestPromises = [];
  141 | 
  142 |         // Eu preparei aqui as 105 chamadas simultâneas
  143 |         for (let i = 0; i < TOTAL_REQUESTS; i++) {
  144 |             requestPromises.push(request.get(`${baseURL}/usuarios`));
  145 |         }
  146 | 
  147 |         // Eu faço disparar todas de uma vez para forçar o limite de taxa
  148 |         const responses = await Promise.all(requestPromises);
  149 | 
  150 |         // Eu Mapeio os status codes
  151 |         const statusCodes = responses.map(res => res.status());
  152 | 
  153 |         //Eu Valido se houve bloqueio (Rate Limit)
  154 |         const containsRateLimitError = statusCodes.includes(429);
  155 | 
  156 |         expect(
  157 |             containsRateLimitError, 
  158 |             'The API should return 429 Too Many Requests when exceeding 100 req/min'
> 159 |         ).toBeTruthy();
      |           ^ Error: The API should return 429 Too Many Requests when exceeding 100 req/min
  160 |     });
  161 | 
  162 |     test('Scenario 9: Validate the message different of password é obrigatório nao é aceito', async ({ request }) => {
  163 |         const response = await request.post(`${baseURL}/usuarios`, {
  164 |             data: {
  165 |                 nome: "Ana Silva",
  166 |                 email: `ana_${Date.now()}@teste.com`,
  167 |                 // eu omiti o password de propósito
  168 |                 administrador: "true"
  169 |             }
  170 |         });
  171 | 
  172 |         expect(response.status()).toBe(400); 
  173 |         const body = await response.json();
  174 |         // Validação do que esta certo
  175 |         expect(body.password).toBe("password é obrigatório");
  176 |         // Validação do que esta errado
  177 |         expect(body.password).not.toBe("password não pode ficar em branco");
  178 |     });
  179 | 
  180 | });
```