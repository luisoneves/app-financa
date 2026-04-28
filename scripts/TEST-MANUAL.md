# Testes Manuais — app-financa

Execute estes testes após deploy no Cloudflare Pages/Workers.

## 🔐 Auth (T-004)

- [ ] **Login com credenciais válidas**
  - Acesse `https://seu-app.pages.dev/login`
  - Use: `user123` / `senha123`
  - Deve redirecionar para `/`

- [ ] **Login com credenciais inválidas**
  - Use: `wrong` / `wrong`
  - Deve mostrar erro 401

- [ ] **Logout**
  - Clique em "Sair" no dashboard
  - Deve redirecionar para `/login`

---

## 💰 Transações (T-005 + T-007)

- [ ] **Listar transações**
  - Acesse `/transacoes`
  - Deve mostrar lista (ou vazia se não houver)

- [ ] **Criar transação**
  - Clique em "+ Nova"
  - Preencha: Despesa, R$ 50,00, Alimentação, Débito
  - Salvar → deve aparecer na lista

- [ ] **Toggle view**
  - Mude de "Minhas" para "Todas"
  - Lista deve atualizar

- [ ] **Filtro por período** ⚠️ PENDENTE
  - Testar `?period=day`, `?period=week`, `?period=month`
  - Backend ainda não implementou

---

## 📊 Dashboard (T-006)

- [ ] **Resumo financeiro**
  - Acesse `/`
  - Deve mostrar: Receitas, Despesas, Saldo
  - Gráficos Recharts devem renderizar

---

## 📅 Calendário (T-008)

- [ ] **Visualizar calendário**
  - Acesse `/calendario`
  - Deve mostrar mês atual com dias

- [ ] **Criar evento**
  - Clique em "+ Novo"
  - Preencha título, data, hora
  - Salvar → deve aparecer no calendário

- [ ] **Toggle view**
  - Mude de "Minhas" para "Compartilhadas"

---

## ✅ Kanban (T-009 + T-010)

- [ ] **Visualizar quadro**
  - Acesse `/tarefas`
  - Deve mostrar 3 colunas: A Fazer, Em Progresso, Concluído

- [ ] **Criar tarefa**
  - Clique em "+ Nova"
  - Preencha título, prioridade
  - Salvar → deve aparecer em "A Fazer"

- [ ] **Mover tarefa**
  - Clique em "→" para mover para "Em Progresso"
  - Clique em "→" novamente para "Concluído"

- [ ] **Deletar tarefa**
  - Clique em "×" na tarefa
  - Deve remover da lista

- [ ] **Toggle view**
  - Mude para "Compartilhadas"
  - Lista deve atualizar

---

## 🐛 Bugs Conhecidos (Termux)

- ⚠️ `pnpm dev` com `--host 0.0.0.0` falha no Termux
  - **Solução:** Use `vite dev --host 127.0.0.1`
- ⚠️ Build com `adapter-cloudflare` trava por memória
  - **Solução:** Use `adapter-auto` para dev local
  - Deploy real via git push (Cloudflare builda na nuvem)

---

## 📝 Próximos Passos

1. Fazer deploy no Cloudflare (git push)
2. Executar testes manuais acima
3. Implementar T-007 (filtros por período)
4. Migrar `adapter-auto` → `adapter-cloudflare` após deploy
