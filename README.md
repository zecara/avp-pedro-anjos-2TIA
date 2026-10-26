# Catálogo de Jogos API

API REST desenvolvida com **Node.js**, **Express** e **Prisma** para gerenciar
um catálogo de jogos com armazenamento em **MySQL/MariaDB**. O projeto inclui
cadastro de usuários, login com token JWT, proteção de rotas, upload de imagens e
documentação interativa com Swagger.

## Tema do projeto

Catálogo de Jogos: permite cadastrar, listar, consultar, editar e excluir
jogos, cada um com título, gênero, plataforma, ano de lançamento, nota e
status de conclusão.

## Tecnologias utilizadas

- Node.js
- Express 5
- Prisma 6 com MySQL/MariaDB
- JSON Web Token (`jsonwebtoken`)
- Criptografia de senhas com `bcrypt`
- Upload de arquivos com `multer`
- Documentação com `swagger-jsdoc` e `swagger-ui-express`
- Insomnia / Postman (para testes das rotas)

## Estrutura do projeto

Os comandos da pasta acima do app são atalhos para este pacote. Todos os scripts
Prisma deste projeto usam exclusivamente `avp-pedro-anjos-2TIA/prisma/schema.prisma`;
a pasta `prisma/` da raiz do workspace fica fora do pacote e não é usada por eles.

```
avp-pedro-anjos-2TIA/
├── .env.example             # Modelo de configuração local
├── controllers/
│   ├── jogosController.js   # Regras e operações dos jogos
│   └── usuariosController.js # Cadastro e autenticação
├── middlewares/
│   ├── authMiddleware.js    # Validação do token JWT
│   ├── logMiddleware.js     # Registro das requisições
│   └── uploadMiddleware.js  # Validação do upload
├── data/
│   └── jogos.js             # Dados iniciais do catálogo
├── routes/
│   ├── jogosRoutes.js        # Rotas de /jogos
│   ├── usuariosRoutes.js     # Rotas de /usuarios
│   └── uploadRoutes.js       # Rota de upload
├── lib/
│   ├── imageTypes.js         # Validação de assinaturas das imagens
│   └── prisma.js             # Cliente Prisma compartilhado
├── prisma/
│   ├── schema.prisma         # Modelos Jogo e Usuario
│   └── migrations/           # Histórico de alterações do banco
├── scripts/
│   └── setup.js              # Prepara .env sem sobrescrever dados existentes
├── tests/
│   ├── api.test.js           # Testes de integração (banco de teste separado)
│   └── upload.test.js        # Testes unitários de imagem
├── uploads/                  # Arquivos enviados, não versionados
├── server.js                 # Configuração e inicialização do Express
├── swagger.js                # Configuração OpenAPI/Swagger
├── swagger.css               # Tema da documentação
├── package-lock.json
├── package.json
└── README.md
```

## Como executar o projeto

Requisitos: Node.js 18.18 ou superior e npm.

1. Clone o repositório e entre no pacote da API:
   ```bash
  git clone https://github.com/zecara/avp-pedro-anjos-2TIA.git
  cd avp-pedro-anjos-2TIA
   ```

2. Instale as dependências e configure o ambiente local:
  ```bash
  npm ci
  npm run setup
  ```
  O setup cria uma chave JWT local e, quando disponível, copia a URL do banco
  configurada na pasta do workspace. Ele preserva valores já existentes.

3. Edite `DATABASE_URL` no `.env` com os dados do MySQL/MariaDB, no formato
  `mysql://usuario:senha@localhost:3306/nome_do_banco`. Gere o client e aplique
  as migrações:
  ```bash
  npm run db:generate
  npm run db:migrate
  ```
  **Atenção:** o histórico contém uma migração que renomeia a tabela antiga
  `jogos` e outra que remove `jogos_legacy`. Se o banco tiver dados antigos que
  precisam ser preservados, faça e teste um backup e revise o histórico antes
  de migrar. Em uma tabela `jogos` vazia, o servidor insere os dados iniciais.

4. Inicie o servidor dentro de `avp-pedro-anjos-2TIA`:
   ```bash
   npm start
   ```
   ou em modo desenvolvimento (reinicia sozinho a cada alteração):
   ```bash
   npm run dev
   ```

5. A API estará disponível em:
   ```
   http://localhost:3000
  ```
  `npm test` roda os testes. Na raiz do workspace, os scripts do `package.json`
  também encaminham os comandos para este pacote.

## Estrutura de um jogo (objeto)

```json
{
  "id": 1,
  "titulo": "Red Dead Redemption",
  "genero": "Ação/Aventura",
  "plataforma": "PS4",
  "anoLancamento": 2010,
  "nota": 9.6,
  "concluido": true
}
```

O campo `id` é gerado automaticamente pelo servidor — não deve ser enviado
no corpo da requisição ao cadastrar um jogo.

## Jogos pré-cadastrados

Ao iniciar pela primeira vez com uma tabela `jogos` vazia, a API insere os
18 jogos iniciais definidos em `data/jogos.js`. A tabela abaixo mostra alguns:

| Título                  | Gênero               | Plataforma | Ano |
|-------------------------|----------------------|------------|-----|
| Red Dead Redemption     | Ação/Aventura        | PS4        | 2010 |
| Red Dead Redemption 2   | Ação/Aventura        | PS5        | 2018 |
| Stardew Valley          | Simulação            | PC         | 2016 |
| Shadow of the Colossus  | Aventura             | PS4        | 2018 |
| God of War Ragnarök     | Ação                 | PS5        | 2022 |
| The Last of Us Part II  | Ação/Sobrevivência   | PS5        | 2020 |

## Organização da arquitetura

O projeto separa as responsabilidades por camadas: `routes/` define os
endereços e métodos HTTP, `controllers/` concentra as regras de negócio,
`middlewares/` cuida de autenticação, logs e upload, e `lib/prisma.js` mantém
a conexão com o banco. O Prisma persiste jogos e usuários. O `server.js` configura o Express, os
middlewares globais e o agrupamento das rotas, enquanto `swagger.js` expõe a
documentação OpenAPI.

## Rotas disponíveis

| Método | Rota                    | Descrição                                  |
|--------|-------------------------|-------------------------------------------|
| POST   | `/usuarios`             | Cadastra um usuário                        |
| POST   | `/login`                | Autentica e retorna um token JWT            |
| GET    | `/jogos`                | Lista todos os jogos cadastrados           |
| GET    | `/jogos/estatisticas`   | Retorna um resumo dos dados no banco       |
| GET    | `/jogos/:id`            | Consulta um jogo específico pelo ID        |
| POST   | `/jogos`                | Cadastra um novo jogo                      |
| PATCH  | `/jogos/:id`            | Edita um jogo existente                    |
| DELETE | `/jogos/:id`            | Remove um jogo pelo ID                     |
| POST   | `/upload`               | Envia uma imagem                            |
| GET    | `/api-docs`             | Abre a documentação interativa             |

As rotas de `/jogos` e `/upload` exigem o cabeçalho:

```text
Authorization: Bearer SEU_TOKEN
```

### Cadastro e login

Crie um usuário com `POST /usuarios`:

```json
{
  "nome": "Pedro Anjos",
  "email": "pedro@example.com",
  "senha": "senha123"
}
```

Depois, faça `POST /login` com o mesmo e-mail e senha. A resposta contém o
campo `token`, válido por uma hora, que deve ser enviado nas rotas protegidas.

### `GET /jogos`

Além dos dados brutos, esta rota aceita filtros e ordenação por query string:

- `?genero=RPG` -> filtra por gênero parcialmente (respeita a collation do banco).
- `?concluido=true` ou `?concluido=false` -> filtra por status de conclusão.
- `?ordenarPor=nota` -> ordena por `titulo`, `anoLancamento` ou `nota`.

Exemplos:

```bash
GET /jogos?genero=rpg
GET /jogos?concluido=false&ordenarPor=nota
GET /jogos?genero=acao&concluido=true&ordenarPor=anoLancamento
```

Se a query string não for informada, a rota continua retornando todos os jogos.

Resposta de sucesso:

```json
[
  {
    "id": 1,
    "titulo": "Red Dead Redemption",
    "genero": "Ação/Aventura",
    "plataforma": "PS4",
    "anoLancamento": 2010,
    "nota": 9.6,
    "concluido": true
  }
]
```

O array retornado contém todos os jogos cadastrados, não apenas o exemplo
acima.

### `GET /jogos/estatisticas`

Retorna um resumo calculado a partir dos dados armazenados no banco.

Exemplo de resposta:

```json
{
  "totalJogos": 18,
  "quantidadeConcluidos": 8,
  "quantidadeNaoConcluidos": 10,
  "notaMedia": 9.4,
  "generoMaisFrequente": "Ação/Aventura"
}
```

### Regras de validação atualizadas

Nos cadastros e edições, os campos opcionais passam a ser validados somente
quando forem enviados pelo cliente.

- `anoLancamento`: deve ser um número inteiro entre `1970` e `anoAtual + 1`.
- `nota`: deve ser um número entre `0` e `10`.
- `concluido`: deve ser estritamente booleano (`true` ou `false`).

Qualquer valor com tipo ou formato inválido retorna `400 Bad Request` com
resposta no formato:

```json
{
  "erro": "Mensagem clara indicando o campo inválido."
}
```

### Middleware de log

O servidor registra cada requisição no console com o método HTTP, a rota e o
horário em formato ISO, por exemplo:

```text
[2026-08-22T14:30:00.000Z] GET /jogos
```

### `GET /jogos/:id`

- Corpo da requisição: não se aplica; a rota não exige campos.
- Sucesso: `200 OK`.
- Erro: `404 Not Found` quando o ID não é encontrado.

Resposta de sucesso para `/jogos/1`:

```json
{
  "id": 1,
  "titulo": "Red Dead Redemption",
  "genero": "Ação/Aventura",
  "plataforma": "PS4",
  "anoLancamento": 2010,
  "nota": 9.6,
  "concluido": true
}
```

Resposta de erro para `/jogos/999`:

```json
{
  "erro": "Jogo com ID 999 não encontrado."
}
```

### `POST /jogos`

- Campos obrigatórios: `titulo`, `genero` e `plataforma`.
- Campos opcionais: `anoLancamento`, `nota` e `concluido`.
- Sucesso: `201 Created`.
- Erro: `400 Bad Request` quando falta um campo obrigatório.

Resposta de sucesso:

```json
{
  "mensagem": "Jogo cadastrado com sucesso.",
  "jogo": {
    "id": 19,
    "titulo": "Elden Ring",
    "genero": "RPG",
    "plataforma": "PC",
    "anoLancamento": 2022,
    "nota": 9.8,
    "concluido": false
  }
}
```

Resposta de erro:

```json
{
  "erro": "Os campos 'titulo', 'genero' e 'plataforma' são obrigatórios."
}
```

Quando os campos opcionais não são enviados, `anoLancamento` e `nota` recebem
`null`, e `concluido` recebe `false`.

### `PATCH /jogos/:id`

- Corpo da requisição: todos os campos são opcionais; somente os campos
  enviados são alterados. São aceitos `titulo`, `genero`, `plataforma`,
  `anoLancamento`, `nota`, `concluido`, `desenvolvedora`, `distribuidora`,
  `classificacaoIndicativa`, `horasParaZerar` e `sinopse`.
- Sucesso: `200 OK`.
- Erro: `404 Not Found` quando o ID não é encontrado.

Resposta de sucesso para `/jogos/1`:

```json
{
  "mensagem": "Jogo atualizado com sucesso.",
  "jogo": {
    "id": 1,
    "titulo": "Red Dead Redemption",
    "genero": "Ação/Aventura",
    "plataforma": "PS4",
    "anoLancamento": 2010,
    "nota": 10,
    "concluido": true
  }
}
```

Resposta de erro para `/jogos/999`:

```json
{
  "erro": "Jogo com ID 999 não encontrado."
}
```

### `DELETE /jogos/:id`

- Corpo da requisição: não se aplica; a rota não exige campos.
- Sucesso: `200 OK`.
- Erro: `404 Not Found` quando o ID não é encontrado.

Resposta de sucesso para `/jogos/1`:

```json
{
  "mensagem": "Jogo removido com sucesso.",
  "jogo": {
    "id": 1,
    "titulo": "Red Dead Redemption",
    "genero": "Ação/Aventura",
    "plataforma": "PS4",
    "anoLancamento": 2010,
    "nota": 9.6,
    "concluido": true
  }
}
```

Resposta de erro para `/jogos/999`:

```json
{
  "erro": "Jogo com ID 999 não encontrado."
}
```

## Erros comuns

### `400 Bad Request` — validação

Ocorre no cadastro quando `titulo`, `genero` ou `plataforma` não é enviado:

```json
{
  "erro": "Os campos 'titulo', 'genero' e 'plataforma' são obrigatórios."
}
```

### `404 Not Found` — jogo não encontrado

Ocorre ao consultar, editar ou excluir um ID que não existe:

```json
{
  "erro": "Jogo com ID 999 não encontrado."
}
```

## Exemplos de teste no Insomnia / Postman

Antes de testar as rotas protegidas, faça login e configure o token retornado
como Bearer Token no Insomnia ou Postman.

### 1. Listar todos os jogos
```
GET http://localhost:3000/jogos
Authorization: Bearer SEU_TOKEN
```

### 2. Consultar um jogo pelo ID
```
GET http://localhost:3000/jogos/1
Authorization: Bearer SEU_TOKEN
```

### 3. Cadastrar um novo jogo
```
POST http://localhost:3000/jogos
Content-Type: application/json
Authorization: Bearer SEU_TOKEN

{
  "titulo": "Elden Ring",
  "genero": "RPG",
  "plataforma": "PC",
  "anoLancamento": 2022,
  "nota": 9.8,
  "concluido": false
}
```

### 4. Editar um jogo existente
```
PATCH http://localhost:3000/jogos/1
Content-Type: application/json
Authorization: Bearer SEU_TOKEN

{
  "concluido": true,
  "nota": 10
}
```
> Só é preciso enviar os campos que deseja alterar.

### 5. Excluir um jogo
```
DELETE http://localhost:3000/jogos/1
Authorization: Bearer SEU_TOKEN
```

### 6. Enviar uma imagem

```text
POST http://localhost:3000/upload
Authorization: Bearer SEU_TOKEN
Campo multipart/form-data: imagem (arquivo)
```

## Documentação Swagger

Com o servidor em execução, acesse:

```text
http://localhost:3000/api-docs
```

Também é possível consultar o documento OpenAPI em:

```text
http://localhost:3000/api-docs/swagger.json
```

## Observações

- Jogos e usuários ficam persistidos no MySQL/MariaDB e permanecem após
  reiniciar o servidor.
- Todas as respostas são retornadas em formato JSON.
- O token JWT expira após uma hora. `JWT_SECRET` é criada localmente por
  `npm run setup`; não compartilhe nem versione o arquivo `.env`.
- Uploads aceitam JPG/JPEG, PNG ou WEBP de até 2 MB e ficam disponíveis em
  `/uploads`. O servidor valida a assinatura do arquivo, não apenas o MIME enviado.
- Os testes de integração ficam desativados por padrão para impedir gravações
  acidentais no banco normal. Para executá-los, configure `API_TEST_DATABASE_URL`
  para um schema MySQL separado cujo nome contenha `test` (por exemplo,
  `catalogo_test`).
- Erros (ex: ID inexistente, campos obrigatórios faltando) retornam um
  código de status apropriado (`400`, `401`, `404` ou `409`) junto de uma mensagem
  explicativa.

## Autor

Nome: Pedro Anjos
Turma: 2TIA
