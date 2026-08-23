# Catálogo de Jogos API

API REST desenvolvida com **Node.js** e **Express**, simulando um sistema de
catálogo de jogos com armazenamento **em memória** (os dados existem apenas
enquanto o servidor está rodando).

Projeto desenvolvido para a avaliação **AV1** — Servidor Express com CRUD em
memória. Será evoluído na **AV2** com cadastro de usuários, login,
criptografia de senhas, proteção de rotas, upload de arquivos e documentação
com Swagger.

## Tema do projeto

Catálogo de Jogos: permite cadastrar, listar, consultar, editar e excluir
jogos, cada um com título, gênero, plataforma, ano de lançamento, nota e
status de conclusão.

## Tecnologias utilizadas

- Node.js
- Express 5
- Armazenamento em memória (array de objetos JavaScript)
- Insomnia / Postman (para testes das rotas)

## Estrutura do projeto

```
avp-pedro-anjos-2TIA/
├── controllers/
│   └── jogosController.js   # Lógica das operações de CRUD
├── data/
│   └── jogos.js              # "Banco de dados" em memória + gerador de ID
├── routes/
│   └── jogosRoutes.js        # Definição das rotas de /jogos
├── server.js                 # Arquivo principal, inicia o servidor Express
├── package.json
└── README.md
```

## Como executar o projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor:
   ```bash
   npm start
   ```
   ou em modo desenvolvimento (reinicia sozinho a cada alteração):
   ```bash
   npm run dev
   ```

3. O servidor estará disponível em:
   ```
   http://localhost:3000
   ```

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

Ao iniciar, a API carrega estes jogos no array em memória de
`data/jogos.js`:

| Título                  | Gênero               | Plataforma | Ano |
|-------------------------|----------------------|------------|-----|
| Red Dead Redemption     | Ação/Aventura        | PS4        | 2010 |
| Red Dead Redemption 2   | Ação/Aventura        | PS5        | 2018 |
| Stardew Valley          | Simulação            | PC         | 2016 |
| Shadow of the Colossus  | Aventura             | PS4        | 2018 |
| God of War Ragnarök     | Ação                 | PS5        | 2022 |
| The Last of Us Part II  | Ação/Sobrevivência   | PS5        | 2020 |

## Organização da arquitetura

O projeto separa as responsabilidades em três partes: `routes/` define os
endereços e métodos HTTP, `controllers/` concentra a lógica do CRUD e das
respostas, e `data/` mantém o array em memória e o gerador de IDs. O
`server.js` configura o Express, o middleware JSON e o agrupamento das rotas
em `/jogos`, deixando cada arquivo com uma responsabilidade clara.

## Rotas disponíveis

| Método | Rota                    | Descrição                                  |
|--------|-------------------------|-------------------------------------------|
| GET    | `/jogos`                | Lista todos os jogos cadastrados           |
| GET    | `/jogos/estatisticas`   | Retorna um resumo dos dados em memória     |
| GET    | `/jogos/:id`            | Consulta um jogo específico pelo ID        |
| POST   | `/jogos`                | Cadastra um novo jogo                      |
| PUT    | `/jogos/:id`            | Edita um jogo existente                    |
| DELETE | `/jogos/:id`            | Remove um jogo pelo ID                     |

### `GET /jogos`

Além dos dados brutos, esta rota aceita filtros e ordenação por query string:

- `?genero=RPG` -> filtra por gênero de forma case-insensitive e parcial.
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

Retorna um resumo calculado a partir dos dados em memória.

Exemplo de resposta:

```json
{
  "totalJogos": 6,
  "quantidadeConcluidos": 4,
  "quantidadeNaoConcluidos": 2,
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
    "id": 7,
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

### `PUT /jogos/:id`

- Corpo da requisição: todos os campos são opcionais; somente os campos
  enviados são alterados. Os campos aceitos são `titulo`, `genero`,
  `plataforma`, `anoLancamento`, `nota` e `concluido`.
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

### 1. Listar todos os jogos
```
GET http://localhost:3000/jogos
```

### 2. Consultar um jogo pelo ID
```
GET http://localhost:3000/jogos/1
```

### 3. Cadastrar um novo jogo
```
POST http://localhost:3000/jogos
Content-Type: application/json

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
PUT http://localhost:3000/jogos/1
Content-Type: application/json

{
  "concluido": true,
  "nota": 10
}
```
> Só é preciso enviar os campos que deseja alterar.

### 5. Excluir um jogo
```
DELETE http://localhost:3000/jogos/1
```

## Observações

- Os dados são armazenados apenas em memória (array), portanto são
  perdidos sempre que o servidor é reiniciado.
- Todas as respostas são retornadas em formato JSON.
- Erros (ex: ID inexistente, campos obrigatórios faltando) retornam um
  código de status apropriado (`400` ou `404`) junto de uma mensagem
  explicativa.

## Autor

Nome: Pedro Anjos
Turma: 2TIA
