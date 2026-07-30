# ReclamaAI API

API em Node.js + TypeScript para registrar e acompanhar problemas públicos, com autenticação JWT, persistência em PostgreSQL via Prisma e documentação automática em `/docs`.

## Stack

- Fastify
- TypeScript
- Prisma + PostgreSQL
- Zod
- JWT (`@fastify/jwt`)
- Swagger + Scalar

## Pré-requisitos

- Node.js 18+
- npm
- PostgreSQL disponível

## Configuração

1. Instale dependências:

```bash
npm install
```

2. Crie o arquivo `.env` na raiz:

```env
DATABASE_URL="******localhost:5432/reclamaai?schema=public"
PORT=3000
HOST="0.0.0.0"
SECRET_KEY="sua-chave-jwt"
OPENAI_API_KEY="sua-chave-openai"
```

3. Gere o client Prisma e aplique as migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

> Em ambiente local de desenvolvimento, você pode usar `npx prisma migrate dev`.

4. (Opcional) Popule o banco com dados de exemplo:

```bash
npm run seed
```

## Execução

### Desenvolvimento

```bash
npm run dev
```

### Build e produção

```bash
npm run build
npm start
```

## Scripts disponíveis

- `npm run dev`: inicia API com hot reload (`tsx watch`).
- `npm run build`: gera client Prisma e compila TypeScript.
- `npm start`: executa versão compilada.
- `npm run seed`: popula banco com dados iniciais.

## Documentação da API

- Swagger/Scalar: `http://localhost:3000/docs` (ou porta definida em `PORT`)

## Autenticação

Use `POST /user/auth` para obter o token JWT e envie no header:

```http
Authorization: ******
```

## Endpoints principais

### Usuário (`/user`)

- `POST /user/register`
- `POST /user/auth`

### Categoria (`/category`)

- `GET /category`
- `GET /category/:id`
- `POST /category`
- `PUT /category/:id` (JWT)
- `DELETE /category/:id`

### Subcategoria (`/subcategory`)

- `GET /subcategory`
- `GET /subcategory/:id`
- `POST /subcategory` (JWT)
- `PUT /subcategory/:id` (JWT)
- `DELETE /subcategory/:id` (JWT)

### Problema (`/problem`)

- `GET /problem`
- `GET /problem/:id`
- `POST /problem`
- `PUT /problem/:id`
- `DELETE /problem/:id` (JWT)

### Comentário (`/comment`)

- `GET /comment`
- `GET /comment/:id`
- `POST /comment` (JWT)
- `PUT /comment/:id` (JWT, apenas autor)
- `DELETE /comment/:id` (JWT, apenas autor)

## Estrutura do projeto

- `/home/runner/work/reclamaai-api/reclamaai-api/src/server.ts`: bootstrap da API
- `/home/runner/work/reclamaai-api/reclamaai-api/src/routes`: rotas por recurso
- `/home/runner/work/reclamaai-api/reclamaai-api/src/lib`: integrações (Prisma/OpenAI)
- `/home/runner/work/reclamaai-api/reclamaai-api/prisma/schema.prisma`: modelos do banco
- `/home/runner/work/reclamaai-api/reclamaai-api/prisma/migrations`: histórico de migrations
- `/home/runner/work/reclamaai-api/reclamaai-api/prisma/seed.ts`: seed de dados
