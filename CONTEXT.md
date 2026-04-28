# app-financa — Context

## Stack

| Camada | Tecnologia |
|-------|-----------|
| Frontend | SvelteKit + Tailwind + Recharts |
| Backend | Hono + Drizzle + D1 |
| Deploy | Cloudflare Pages + Workers |
| Auth | JWT (credenciais .env) |

## Usuários

| ID | Nome | Role |
|----|------|------|
| 1 | SeuNome | user |
| 2 | Nome da Mae | mae |

## Decisões

| ADR | Decisão | Rationale |
|-----|---------|-----------|
| 001 | Monorepo pnpm workspace | Compartilha configs e dependências |
| 002 | Cloudflare D1 | SQLite serverless, sem custo inicial |
| 003 | JWT local | Sem registro público, só usuários definidos |

## Referências

- `../monarca-ai-framework/AGENTS.md` — governança global
- `../monarca-ai-framework/FlowAgent.io/governance/engineering-standards.md`
- `../monarca-ai-framework/FlowAgent.io/governance/definition-of-done.md`