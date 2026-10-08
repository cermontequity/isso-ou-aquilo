# Isso ou Aquilo

Decisões rápidas em grupo: duas opções, voto anônimo, resultado só no fim.

Quem cria a votação faz cadastro, escreve uma pergunta com duas opções e escolhe por quanto tempo ela fica aberta (5, 10, 15, 30 ou 60 min). O sistema gera um link aleatório. Quem recebe o link vota sem precisar de conta. As parciais ficam escondidas até o fim, para ninguém ser influenciado pelo voto dos outros (efeito âncora).

## Stack

Node.js + Express 5 · PostgreSQL (Supabase) + Prisma · Zod · bcrypt · JWT · express-rate-limit

## Como rodar

```bash
npm install
cp .env.example .env      # preencha com os dados do Supabase e um JWT_SECRET
npm run db:migrate        # cria as tabelas no banco
npm run dev               # http://localhost:3000
```

- Painel do criador: `http://localhost:3000`
- Página de votação: `http://localhost:3000/v/<slug>`

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Conexão do Supabase via pooler (porta 6543, com `?pgbouncer=true`) |
| `DIRECT_URL` | Conexão direta (porta 5432), usada pelas migrations |
| `JWT_SECRET` | Segredo para assinar os tokens |
| `PORT` | Porta da API |
| `CORS_ORIGIN` | Origens permitidas no CORS, separadas por vírgula (ex.: `http://localhost:3000,http://localhost:3001`) |

## Arquitetura

```
src/
├── server.js          # monta o Express: CORS, JSON, rotas, erros
├── schemas.js         # validações Zod
├── routes/            # define URLs e middlewares de cada rota
├── controllers/       # lê a requisição e devolve a resposta HTTP
├── services/          # regras de negócio e acesso ao banco
├── middlewares/       # auth (JWT), validate (Zod), rateLimit, errorHandler
└── lib/               # cliente Prisma e AppError
public/                # front mínimo (HTML + JS puro)
prisma/schema.prisma   # modelo de dados
```

Fluxo: **rota → controller → service → Prisma**. Erros lançados em qualquer camada caem no `errorHandler` (o Express 5 captura erros de funções async automaticamente).

### Modelo de dados

```
User 1 ── N Poll 1 ── N Vote
```

- **User**: criador das votações (senha com hash bcrypt)
- **Poll**: pergunta, opção A, opção B, `slug` (link aleatório) e `expiresAt`
- **Vote**: escolha (`A` ou `B`) e `voterToken` anônimo. A combinação `(pollId, voterToken)` é única.

### Decisões de design

- **Link não rastreável**: o `slug` é gerado com `crypto.randomBytes(12)` e não tem relação com o id do banco. Não dá para adivinhar o link de outra votação.
- **Voto anônimo sem cadastro**: o navegador gera um token aleatório por votação e guarda no `localStorage`. O banco impede o mesmo token de votar duas vezes. Nada identifica a pessoa.
- **Rate limit por IP**: no máximo 15 votos a cada 10 min por IP. O limite não é 1 porque um grupo costuma estar na mesma rede (mesmo IP). O IP fica só na memória, nunca vai para o banco.
- **Sem efeito âncora**: enquanto a votação está aberta, ninguém vê as parciais, nem o criador (ele vê apenas quantos votaram).
- **Edição travada**: a votação só pode ser editada enquanto não tiver votos, para não corromper o resultado.
- **Empate**: 50/50 retorna `winner: "TIE"`.

## Endpoints

Base: `/api`

### Autenticação (rate limit: 10 req / 15 min por IP)

| Método | Rota | Body | Descrição |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | Cadastra e retorna `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` | Retorna `{ token, user }` |

### Votações do criador 🔒 (header `Authorization: Bearer <token>`)

| Método | Rota | Body | Descrição |
|---|---|---|---|
| POST | `/polls` | `{ question, optionA, optionB, duration }` | Cria votação (`duration`: 5, 10, 15, 30 ou 60) |
| GET | `/polls` | | Lista as votações do usuário |
| GET | `/polls/:id` | | Detalhe (resultado só se encerrada) |
| PUT | `/polls/:id` | `{ question?, optionA?, optionB? }` | Edita (só sem votos) |
| DELETE | `/polls/:id` | | Remove a votação e seus votos |

### Públicas (quem tem o link)

| Método | Rota | Body | Descrição |
|---|---|---|---|
| GET | `/p/:slug` | | Pergunta, opções, horário de término e resultado (se encerrada) |
| POST | `/p/:slug/vote` | `{ choice: "A" \| "B", voterToken }` | Registra o voto (rate limit: 15 / 10 min por IP) |

### Respostas de erro

Todas no formato `{ "error": "mensagem" }`. Erros de validação trazem também `details: [{ field, message }]`.

| Status | Quando |
|---|---|
| 400 | Dados inválidos / JSON inválido |
| 401 | Sem token, token inválido ou login errado |
| 403 | Votar em votação encerrada |
| 404 | Votação não encontrada (ou de outro usuário) |
| 409 | Email já cadastrado, voto repetido ou edição com votos |
| 429 | Rate limit atingido |
