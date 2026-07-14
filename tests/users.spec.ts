import { test, expect } from '@playwright/test';
import path from 'path';
import process from 'process';
import fs from 'fs';

const baseURL = 'https://serverest.dev';

// Variáveis globais para armazenar os dados de estado entre os testes
let authToken = '';
let userId = '';
let uniqueEmail = `qa_${Date.now()}@carrefour.com`;

// Usei .serial para garantir que os testes rodem em ordem, pois dependem um do outro
test.describe.serial('API - User Management Workflow (Carrefour)', () => {

    // ==========================================
    // --- POSITIVE TESTS (Happy Path) ---
    // ==========================================

    test('Scenario 1: Should create a user successfully with all valid fields', async ({ request }, testInfo) => {
        const testName = testInfo.title.replace(/[\s:]+/g, '_');
        const evidenceDir = path.join(process.cwd(), 'evidence', testName);
        if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

        const response = await request.post(`${baseURL}/usuarios`, {
            data: {
                nome: "Fulano Silva",
                email: uniqueEmail,
                password: "senha_segura",
                administrador: "true"
            }
        });

        expect(response.status()).toBe(201);
        const body = await response.json();
        
        fs.writeFileSync(path.join(evidenceDir, 'response.json'), JSON.stringify(body, null, 2));

        expect(body.message).toBe("Cadastro realizado com sucesso");
        expect(body).toHaveProperty('_id');
        
        // Salvando o ID para os próximos cenários
        userId = body._id;
    });

    test('Scenario 2: Should authenticate user and generate JWT token', async ({ request }, testInfo) => {
        const testName = testInfo.title.replace(/[\s:]+/g, '_');
        const evidenceDir = path.join(process.cwd(), 'evidence', testName);
        if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

        const response = await request.post(`${baseURL}/login`, {
            data: {
                email: uniqueEmail,
                password: "senha_segura"
            }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        
        fs.writeFileSync(path.join(evidenceDir, 'response.json'), JSON.stringify(body, null, 2));

        expect(body.message).toBe("Login realizado com sucesso");
        expect(body).toHaveProperty('authorization');
        
        // Salvando o Token JWT para os próximos cenários
        authToken = body.authorization;
    });

    test('Scenario 3: Should return a list of all users', async ({ request }, testInfo) => {
        const testName = testInfo.title.replace(/[\s:]+/g, '_');
        const response = await request.get(`${baseURL}/usuarios`);
        expect(response.status()).toBe(200);
        
        const body = await response.json();
        expect(Array.isArray(body.usuarios)).toBeTruthy();
    });

    test('Scenario 4: Should return details of a specific user by ID', async ({ request }, testInfo) => {
        const testName = testInfo.title.replace(/[\s:]+/g, '_');
        const response = await request.get(`${baseURL}/usuarios/${userId}`);
        expect(response.status()).toBe(200);
        
        const body = await response.json();
        expect(body.email).toBe(uniqueEmail);
    });

    test('Scenario 5: Should update user information successfully', async ({ request }, testInfo) => {
        const testName = testInfo.title.replace(/[\s:]+/g, '_');
        const response = await request.put(`${baseURL}/usuarios/${userId}`, {
            headers: { 'Authorization': authToken },
            data: {
                nome: "Fulano Silva Atualizado",
                email: uniqueEmail,
                password: "nova_senha_segura",
                administrador: "true"
            }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.message).toBe('Registro alterado com sucesso');
    });

    test('Scenario 6: Should delete the created user successfully', async ({ request }, testInfo) => {
        const testName = testInfo.title.replace(/[\s:]+/g, '_');
        const response = await request.delete(`${baseURL}/usuarios/${userId}`, {
            headers: { 'Authorization': authToken }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.message).toBe('Registro excluído com sucesso');
    });

    // ==========================================
    // --- NEGATIVE TESTS & EDGE CASES ---
    // ==========================================

    test('Scenario 7: Should not create a user when a mandatory field is missing', async ({ request }, testInfo) => {
        const testName = testInfo.title.replace(/[\s:]+/g, '_');
        const response = await request.post(`${baseURL}/usuarios`, {
            data: {
                nome: "Ana Silva",
                email: `ana_${Date.now()}@teste.com`,
                // eu omiti o password de propósito
                administrador: "true"
            }
        });

        expect(response.status()).toBe(400); 
        const body = await response.json();
        expect(body.password).toBe("password é obrigatório");
    });

    // ==========================================
    // --- RATE LIMITING TEST ---
    // ==========================================

    test('Scenario 8: Should return status 429 when exceeding the limit of 100 requests per minute', async ({ request }, testInfo) => {
        const testName = testInfo.title.replace(/[\s:]+/g, '_');
        // Indica ao Playwright que sabemos que este teste vai falhar devido a uma limitação da API mock (ServeRest)
        test.fail(true, 'BUG: A API ServeRest não implementa o Rate Limit de 100 req/min exigido no requisito.');

        const TOTAL_REQUESTS = 105; 
        const requestPromises = [];

        // Eu preparei aqui as 105 chamadas simultâneas
        for (let i = 0; i < TOTAL_REQUESTS; i++) {
            requestPromises.push(request.get(`${baseURL}/usuarios`));
        }

        // Eu faço disparar todas de uma vez para forçar o limite de taxa
        const responses = await Promise.all(requestPromises);

        // Eu Mapeio os status codes
        const statusCodes = responses.map(res => res.status());

        //Eu Valido se houve bloqueio (Rate Limit)
        const containsRateLimitError = statusCodes.includes(429);

        expect(
            containsRateLimitError, 
            'The API should return 429 Too Many Requests when exceeding 100 req/min'
        ).toBeTruthy();
    });

    test('Scenario 9: Validate the message different of password é obrigatório nao é aceito', async ({ request }, testInfo) => {
        const testName = testInfo.title.replace(/[\s:]+/g, '_');
        const response = await request.post(`${baseURL}/usuarios`, {
            data: {
                nome: "Ana Silva",
                email: `ana_${Date.now()}@teste.com`,
                // eu omiti o password de propósito
                administrador: "true"
            }
        });

        expect(response.status()).toBe(400); 
        const body = await response.json();
        // Validação do que esta certo
        expect(body.password).toBe("password é obrigatório");
        // Validação do que esta errado
        expect(body.password).not.toBe("password não pode ficar em branco");
    });

});