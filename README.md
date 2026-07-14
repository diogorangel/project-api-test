# Automação de Testes de API
# Author : Diogo Rangel 
- (diogorangel - https://github.com/diogorangel)

1. Este repositório contém o projeto de Automação de Testes de API.

2. O objetivo deste projeto é garantir a qualidade de uma API RESTful de gerenciamento de usuários (operações de Criação, Leitura, Atualização e Exclusão).

A ferramenta escolhida para o desenvolvimento foi o **Playwright** executado em **Node.js**. A escolha se deu pela sua velocidade, robustez na execução de requisições HTTP e excelente geração nativa de relatórios interativos. [cite_start]A API utilizada como base para os testes foi a [ServeRest](https://serverest.dev/#/).

---

## 🛠️ Pré-requisitos

Para executar este projeto localmente, você precisará instalar as seguintes ferramentas:
* **Node.js** (Versão 16 ou superior recomendada)
* **NPM** (Gerenciador de pacotes do Node, já embutido na instalação)
* **Git** (Para clonar o repositório)

---

## 🚀 Configuração do Ambiente e Instalação 

Siga os passos abaixo para preparar o ambiente local:

1. **Clone o repositório:**
   ```bash
   git clone <INCLUA_AQUI_A_URL_DO_SEU_REPOSITORIO>
   cd carrefour-api-test
   
## 🚀 Configuração do Ambiente e Instalação 

Siga os passos abaixo para preparar o ambiente local:

1. **Clone o repositório:**
   ```bash
   git clone <https://github.com/diogorangel/project-api-test.git>
   cd carrefour-api-test

# 2. Instale as dependências do projeto:Bashnpm install

# 3. Instale os navegadores do Playwright
O Playwright precisa desta etapa caso deseje abrir os relatórios em uma interface local)
"
npx playwright install
"
# 4. ▶️ Execução dos Testes  
O Playwright facilita a execução dos cenários de teste através de sua CLI. Utilize os comandos abaixo no seu terminal:Para rodar a suíte completa no terminal (modo headless):

Rodar todos os testes na pasta teste:
. npx playwright test

- Para um conjunto de teste especifico:
npx playwright test tests/users.spec.ts

- Para executar um teste no modo Interface Visual interativa (UI):
npx playwright test tests/users.spec.ts --ui

- Para rodar no modo visivel:
npx playwright test tests/users.spec.ts --headed

- Para abrir o relatorio em seguido dos testes:
npx playwright test tests/users.spec.ts && npx playwright show-report
npx playwright test tests/users.spec.ts ; npx playwright show-report

- Para abrir o navegador:
npx playwright test tests/users.spec.ts --headed

- Para rodar um único cenário (test) dentro desse arquivo:
npx playwright test tests/users.spec.ts -g "Scenario 4"

# 5. Relatorio
Para exibir o relatorio dos ultimos testes
npx playwright show-report

# 6. 🎯 Casos de Teste Cobertos   
A suíte de testes foi arquitetada para garantir 100% de cobertura da API , validando tanto os fluxos de sucesso quanto os cenários de exceção e validação de regras de negócio.  

1. Criação de Usuários (POST /users)   

2. Sucesso: Criação de um novo usuário enviando um corpo JSON com os campos obrigatórios estritamente como string: nome, email, password e administrador. 
 Falha: Validação do comportamento da API ao tentar registrar um e-mail já existente na base.
 Falha: Tentativa de requisição com ausência de campos obrigatórios.
3. Autenticação e Autorização   Sucesso: Execução de requisição de Login para obtenção do token JWT válido.  

4. Falha: Validação de que endpoints protegidos rejeitam requisições caso o token JWT não seja providenciado ou esteja expirado/inválido.  

5. Leitura de Usuários (GET /users e GET /users/{id})   Sucesso: Requisição para retornar a lista completa de todos os usuários cadastrados (GET /users).  

6. Sucesso: Requisição para retornar os detalhes específicos de um usuário utilizando seu ID dinâmico (GET /users/{id}).  Falha: Busca por um ID inexistente para validar o retorno do Status Code 404.4. Atualização de Usuários (PUT /users/{id})   
7. Sucesso: Atualização dos dados de um usuário existente repassando o token JWT no cabeçalho (Header) da requisição.  

8. Exclusão de Usuários (DELETE /users/{id})   
Sucesso: Exclusão de um usuário utilizando seu ID e o devido token de autorização.  Validação Extra: Confirmação de que após a exclusão, uma nova busca GET pelo mesmo ID não localiza mais o registro no sistema.  

9. Limite de Taxas (Rate Limiting)   Simulação controlada de requisições subsequentes rápidas para validar se a API responde adequadamente à limitação máxima de 100 requisições por minuto.  

# ⚙️ Pipeline de CI/CD e Artefatos   
1. Este projeto foi totalmente integrado a uma pipeline de Integração Contínua (CI) utilizando GitHub Actions.  Gatilhos (Triggers): 
A pipeline roda automaticamente a cada push ou criação de pull request na branch principal. 
Rotina: O runner prepara o ambiente Ubuntu, instala o Node.js v18, instala as dependências e executa a suíte npx playwright test.
# Geração de Relatórios
1. Assim que a execução finaliza (independente se os testes passaram ou falharam), o Playwright compila o relatório em HTML. O próprio GitHub Actions extrai esta pasta e a disponibiliza como um Artefato baixável na aba "Actions" do repositório, cumprindo integralmente o requisito de entrega.