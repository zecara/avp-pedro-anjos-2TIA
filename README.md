# Catálogo de Jogos API

API REST desenvolvida com **Node.js** e **Express**, simulando um sistema de
catálogo de jogos com armazenamento **em memória** (os dados existem apenas
enquanto o servidor está rodando).

Projeto desenvolvido para a avaliação **AV1** da disciplina — Servidor Express
com CRUD em memória. Será evoluído na **AV2** com autenticação, upload de
arquivos e documentação Swagger.

## Tema do projeto

Catálogo de Jogos: permite cadastrar, listar, consultar, editar e excluir
jogos, cada um com título, gênero, plataforma, ano de lançamento, nota e
status de conclusão.

## Tecnologias utilizadas

- Node.js
- Express
- Armazenamento em memória (array de objetos JavaScript)
- Insomnia / Postman (para testes das rotas)

## Estrutura do projeto

```
catalogo-jogos-api/
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

1. Clone o repositório:
   ```bash
   git clone <link-do-seu-repositorio>
   cd catalogo-jogos-api
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor:
   ```bash
   node server.js
   ```
   ou, se quiser reiniciar automaticamente a cada alteração:
   ```bash
   npx nodemon server.js
   ```

4. O servidor estará disponível em:
   ```
   http://localhost:3000
   ```

## Estrutura de um jogo (objeto)

```json
{
  "id": 1,
  "titulo": "The Legend of Zelda: Breath of the Wild",
  "genero": "Aventura",
  "plataforma": "Nintendo Switch",
  "anoLancamento": 2017,
  "nota": 9.7,
  "concluido": true
}
```

O campo `id` é gerado automaticamente pelo servidor — não deve ser enviado
no corpo da requisição ao cadastrar um jogo.

## Rotas disponíveis

| Método | Rota          | Descrição                              |
|--------|---------------|-----------------------------------------|
| GET    | `/jogos`      | Lista todos os jogos cadastrados        |
| GET    | `/jogos/:id`  | Consulta um jogo específico pelo ID     |
| POST   | `/jogos`      | Cadastra um novo jogo                   |
| PUT    | `/jogos/:id`  | Edita um jogo existente                 |
| DELETE | `/jogos/:id`  | Remove um jogo pelo ID                  |

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

Nome: _[coloque seu nome aqui]_
Turma: _[coloque sua turma aqui]_
