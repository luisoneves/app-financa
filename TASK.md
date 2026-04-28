# app-financa — Tarefas

## Sprint 1 — Foundation

### T-001 | Estrutura Monorepo
**Resultado:** `app-financa/` com `pnpm-workspace.yaml` funcional
**Escopo:** `frontend/` + `backend/` configurados
**Validação:** `pnpm install` + `pnpm -r run build` passa
**Prioridade:** HIGH

---

### T-002 | Setup Backend (Hono + Drizzle + D1)
**Resultado:** API Backend com autenticação JWT
**Escopo:**
- `backend/src/index.ts`
- `backend/src/middleware/auth.ts`
- `backend/src/db/schema.ts`
- `backend/drizzle.config.ts`
- `backend/wrangler.toml`
**Validação:** `wrangler dev` sobe sem erro
**Prioridade:** HIGH

---

### T-003 | Setup Frontend (SvelteKit + Tailwind)
**Resultado:** Frontend SvelteKit funcional
**Escopo:**
- `frontend/src/routes/+page.svelte`
- `frontend/src/app.css`
- `frontend/svelte.config.js`
**Validação:** `pnpm dev` sobe em localhost
**Prioridade:** HIGH

---

### T-004 | Auth JWT (Login)
**Resultado:** Login com credenciais .env
**Escopo:**
- `backend/src/routes/auth.ts`
- `backend/src/middleware/auth.ts`
- Tabela `users` no D1
**Validação:**
- POST `/api/auth/login` com credenciais válidas → JWT
- POST `/api/auth/login` com credenciais inválidas → 401
**Prioridade:** HIGH

---

## Sprint 2 — Financeiro

### T-005 | CRUD Transações
**Resultado:** Create/Read/List transações
**Escopo:**
- `backend/src/routes/transactions.ts`
- `frontend/src/routes/transacoes/`
**Validação:**
- POST `/api/transactions` cria registro
- GET `/api/transactions` lista por usuário
**Prioridade:** HIGH

---

### T-006 | Dashboard Financeiro
**Resultado:** Gráficos pizza, barras, linha
**Escopo:**
- `frontend/src/routes/dashboard/`
- Componentes Recharts
**Validação:** Gráficos renderizam com dados mock
**Prioridade:** MEDIUM

---

### T-007 | Filtros por Período
**Resultado:** Filtro diário/semanal/mensal
**Escopo:** Query params em GET `/api/transactions`
**Validação:** Resultados filtram por data corretamente
**Prioridade:** MEDIUM

---

## Sprint 3 — Agenda

### T-008 | Calendário Mensal
**Resultado:** Visualização calendário com eventos
**Escopo:**
- `frontend/src/routes/calendario/`
- `backend/src/routes/events.ts`
**Validação:** Calendário mostra mês atual com eventos
**Prioridade:** MEDIUM

---

### T-009 | Kanban Tarefas
**Resultado:** Quadro Kanban funcional
**Escopo:**
- `frontend/src/routes/tarefas/`
- `backend/src/routes/tasks.ts`
**Validação:** Tarefas movem entre colunas (todo/doing/done)
**Prioridade:** MEDIUM

---

### T-010 | Toggle Visão (Individual/Compartilhado)
**Resultado:** Filtro no frontend para filtrar por visão
**Escopo:**
- Query param `?view=mine|shared|all`
- Backend filtra events/tasks por `shared` + `user_id`
**Validação:** Toggle muda o que é exibido
**Prioridade:** MEDIUM

---

### T-011 | Google OAuth Login
**Resultado:** Login via Google OAuth 2.0
**Escopo:**
- `backend/src/routes/auth.ts` - rotas `/google` e `/google/callback`
- `frontend/src/routes/login/+page.svelte` - botão "Entrar com Google"
- `.dev.vars.example` - variáveis `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `docs/GOOGLE_AUTH_SETUP.md` - documentação de configuração
**Validação:**
- GET `/api/auth/google` redireciona para Google
- GET `/api/auth/google/callback` processa código e retorna JWT
- Botão no frontend redireciona para OAuth
- Login existente continua funcionando
**Prioridade:** MEDIUM

---

## Status Board

| Task | Sprint | Status |
|------|--------|--------|
| T-001 | 1 | ✅ |
| T-002 | 1 | ✅ |
| T-003 | 1 | ✅ |
| T-004 | 1 | ✅ |
| T-005 | 2 | ✅ |
| T-006 | 2 | ✅ |
| T-007 | 2 | ✅ |
| T-008 | 3 | ✅ |
| T-009 | 3 | ✅ |
| T-010 | 3 | ✅ |
| T-011 | 3 | 🚧 |

---

## Definition of Done por Task

- [ ] READY-7 score ≥ 6
- [ ] Código implementado
- [ ] Build passa (`pnpm build`)
- [ ] Teste manual: endpoint/rota funciona
- [ ] Sem secrets hardcoded
- [ ] Logs em pontos críticos