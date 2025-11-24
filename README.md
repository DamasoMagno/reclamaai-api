# ReclamaAI API

Backend em Node.js/TypeScript para cadastro e acompanhamento de problemas públicos. A API usa Fastify, Prisma (PostgreSQL) e JWT, já expõe documentação via Swagger/Scalar em `/docs` e possui seed com dados de exemplo.

## Tecnologias
- Fastify + Zod (`fastify-type-provider-zod`) para rotas e validações
- Prisma (adapter `@prisma/adapter-pg`) com PostgreSQL
- JWT (`@fastify/jwt`) para autenticação
- Swagger + Scalar para documentação interativa
- bcrypt para hashing de senhas

## Pré-requisitos
- Node.js 18+ e npm
- Banco PostgreSQL acessível via `DATABASE_URL`

## Configuração rápida
1) Instale dependências  
`npm install`

2) Crie um arquivo `.env` na raiz com:
```
DATABASE_URL="postgresql://usuario:senha@host:5432/nome_do_banco?schema=public"
PORT=3000
SECRET_KEY="chave-jwt"
OPENAI_API_KEY="sua-chave-openai"
```

3) Gere o client do Prisma e aplique as migrations existentes  
`npx prisma generate`  
`npx prisma migrate deploy`   # ou `npx prisma migrate dev` em ambiente local

4) (Opcional) Popule o banco com dados de demonstração  
`npm run seed`

5) Suba o servidor em modo desenvolvimento  
`npm run dev`

API disponível em `http://localhost:${PORT}` com documentação em `http://localhost:${PORT}/docs`.

## Scripts npm
- `npm run dev`: inicia o servidor com hot-reload (tsx watch).
- `npm run seed`: roda `prisma/seed.ts` e insere categorias, subcategorias, problemas e usuários/comentários de exemplo.

## Modelos principais (Prisma)
- User: email único, senha com hash, role (padrão `USER`), relação com comentários.
- Category e Subcategory: categorias gerais e subcategorias relacionadas.
- Problem: localização, subcategoria, recorrência (`ALWAYS`, `SOMETIMES`, `FIRST`), impacto (`CITY`, `NEIGHBORHOOD`, `STREET`) e status (`STATED`, `IN_PROGRESS`, `FINISHED`).
- Comment: conteúdo, usuário autor e problema associado.

## Autenticação
Autorização via JWT. Obtenha um token em `POST /user/auth` e envie nos endpoints protegidos usando o header `Authorization: Bearer <token>`. Rotas de leitura de categorias, subcategorias e comentários são públicas; rotas de problemas exigem token.

## Principais endpoints
Base URL: `http://localhost:${PORT}`

**Auth / Usuários (`/user`)**
- `POST /user/register` — cria usuário (email, password, name).
- `POST /user/auth` — autentica e retorna JWT.

**Categorias (`/category`)**
- `GET /category?page&limit` — lista categorias com subcategororias. Paginação padrão `page=1&limit=10`.
- `GET /category/:id` — busca categoria por id.
- `POST /category` — cria (JWT).
- `PUT /category/:id` — atualiza nome (JWT).
- `DELETE /category/:id` — exclui (JWT).

**Subcategorias (`/subcategory`)**
- `GET /subcategory?page&limit` — lista com categoria relacionada.
- `GET /subcategory/:id` — detalhe com categoria.
- `POST /subcategory` — cria (JWT, exige `categoryId` existente).
- `PUT /subcategory/:id` — edita nome/categoria (JWT).
- `DELETE /subcategory/:id` — exclui (JWT).

**Problemas (`/problem`)** — todas as rotas exigem JWT
- `GET /problem?page&limit` — lista ordenada por criação (inclui subcategoria e comentários).
- `GET /problem/:id` — detalhe com categoria, subcategoria e comentários + autor.
- `POST /problem` — cria problema (`location`, `subcategoryId`, `recurrence`, `impact`). Se já existir combinação `location + subcategoryId`, retorna o id existente.
- `PUT /problem/:id` — atualiza campos básicos.
- `DELETE /problem/:id` — remove.

**Comentários (`/comment`)**
- `GET /comment?page&limit` — lista com usuário e problema.
- `GET /comment/:id` — detalhe.
- `POST /comment` — cria comentário (`content`, `problemId`) atrelado ao usuário autenticado.
- `PUT /comment/:id` — edita conteúdo (JWT, apenas autor).
- `DELETE /comment/:id` — remove (JWT, apenas autor).

## Documentação e testes rápidos
- Swagger/Scalar: `http://localhost:${PORT}/docs`
- Health simples: subir com `npm run dev` e chamar `GET /category` para validar conexão com DB.

## Estrutura de pastas (resumo)
- `src/server.ts` — bootstrap do Fastify e registro das rotas/plugins.
- `src/routes/` — rotas por recurso.
- `src/lib/` — instâncias de Prisma e OpenAI.
- `prisma/schema.prisma` — modelos e enums do banco.
- `prisma/migrations/` — migrations versionadas.
- `prisma/seed.ts` — carga de dados exemplo.

## Observações
- O client Prisma gerado fica em `generated/prisma`.
- Ajuste `PORT` conforme necessário; CORS está liberado para todos os domínios em desenvolvimento.
