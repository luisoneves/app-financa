# app-financa — Planejamento

## 1. Visão Geral

| Campo | Descrição |
|-------|-----------|
| **Nome** | app-financa |
| **Tipo** | Monorepo — SaaS pessoal |
| **MVP** | Controle financeiro + Calendário/Agenda compartilhado |
| **Usuários** | Você + sua mãe |
| **Stack** | SvelteKit · Hono · Drizzle · D1 · Cloudflare Workers |

---

## 2. Escopo do Projeto

### 2.1 Funcionalidades Core

```
app-financa/
├── frontend/    SvelteKit + Tailwind + Recharts
│   ├── Dashboard financeiro (pizza, barras, linha)
│   ├── Registro de transações
│   ├── Calendário visual mensal
│   └── Agenda Kanban (tarefas compartilhadas)
│
└── backend/    Hono + Drizzle + D1
    ├── Auth JWT (credenciais no .env)
    ├── CRUD transações
    ├── CRUD eventos (calendário)
    └── CRUD tarefas (kanban)
```

### 2.2 Modelo de Dados

```
users
  id          uuid
  name        text
  role        text  ("user" | "mae")
  created_at  timestamptz

transactions
  id          uuid
  user_id     uuid
  type        text  ("income" | "expense")
  amount      decimal
  category    text
  payment     text  ("credit" | "debit" | "cash" | "other")
  description text
  date        date
  created_at  timestamptz

events
  id          uuid
  user_id     uuid
  title       text
  date        date
  time        time
  shared      boolean
  created_at  timestamptz

tasks
  id          uuid
  user_id     uuid
  title       text
  status      text  ("todo" | "doing" | "done")
  priority    text  ("low" | "medium" | "high")
  due_date    date
  shared      boolean
  created_at  timestamptz
```

### 2.3 Visão Compartilhada

```
Agenda — toggle no frontend:
│
│ Minhas          → só owner_id = user logado
│ Compartilhadas  → shared = true + owner de outro usuário
│ Todas          → tudo que o usuário tem acesso
│
│ Calendário: mesma lógica de filtro
│ Kanban:        mesma lógica de filtro
```

### 2.3 Autenticação

```
.users — credenciais importadas do .env (sem registro público)
│
│  usuario_principal=user123
│  senha_principal=senha123
│  nome_principal=SeuNome
│
│  usuario_mae=mae123
│  senha_mae=senha123
│  nome_mae=Nome da Mae
```

---

## 3. Arquitetura

### 3.1 Estrutura de Pastas

```
app-financa/
├── .env                 # atalho (importa do .secrets)
├── .gitignore
├── package.json         # workspace root
├── pnpm-workspace.yaml
│
├── frontend/           # SvelteKit app
│   ├── src/
│   │   ├── routes/
│   │   ├── components/
│   │   ├── lib/
│   │   └── app.html
│   ├── svelte.config.js
│   └── vite.config.ts
│
└── backend/           # Hono API
    ├── src/
    │   ├── index.ts
    │   ├── routes/
    │   ├── middleware/
    │   └── db/
    ├── drizzle.config.ts
    └── wrangler.toml
```

### 3.2 Fluxo de Dados

```
Frontend (SvelteKit)
  → API Routes (/api/*)
    → Auth JWT (middleware)
      → Hono Handlers
        → Drizzle ORM
          → D1 (Cloudflare)
```

---

## 4. Sprints

### Sprint 1 — Foundation (INÍCIO)
- [ ] Monorepo criado (pnpm workspace)
- [ ] Backend Hono + Drizzle + D1
- [ ] Autenticação JWT com credenciais .env
- [ ] Frontend SvelteKit + Tailwind
- [ ] Estrutura base frontend

### Sprint 2 — Financeiro (MEIO)
- [ ] CRUD transações
- [ ] Dashboard com gráficos
- [ ] Filtros por período

### Sprint 3 — Agenda (FIM)
- [ ] Calendário visual mensal
- [ ] CRUD tarefas (Kanban)
- [ ] Compartilhamento mãe

---

## 5. outside Scope

- Registro público de usuários
- Sync offline PWA
- Notificações push
- Exportação PDF/CSV
- Multi-moeda

---

## 6. Deploy

| Serviço | Destino |
|---------|--------|
| Frontend | Cloudflare Pages |
| Backend API | Cloudflare Workers |
| Banco | Cloudflare D1 |
| Wrangler | `CLOUDFLARE_ACCOUNT_ID` no .secrets |

---

## 7. Regras de Governança

> Aplicar:
> - `FlowAgent.io/governance/engineering-standards.md`
> - `FlowAgent.io/governance/definition-of-done.md`
> - `FlowAgent.io/workflow/task-clarity-gate.md`

---

## 8. Validação Final

| Critério | Status |
|---------|--------|
| READY-7 score ≥ 6 antes de cada task | ⬜ |
| DoD completo antes de merge | ⬜ |
| Secrets no .secrets (nenhum no código) | ⬜ |
| CI passando (wrangler deploy --dry-run) | ⬜ |