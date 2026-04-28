<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';

  let transactions = $state<{
    id: string;
    type: string;
    amount: number;
    category: string;
    payment: string;
    description: string;
    date: string;
  }[]>([]);
  let view = $state<'mine' | 'shared' | 'all'>('mine');
  let loading = $state(true);
  let showForm = $state(false);

  let form = $state({
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    category: '',
    payment: 'debit' as 'credit' | 'debit' | 'cash' | 'other',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const categories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Salário', 'Presente', 'Outro'];

  onMount(async () => {
    await loadTransactions();
  });

  async function loadTransactions() {
    loading = true;
    transactions = await api.getTransactions(view);
    loading = false;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    await api.createTransaction(form);
    showForm = false;
    form = { type: 'expense', amount: 0, category: '', payment: 'debit', description: '', date: new Date().toISOString().split('T')[0] };
    await loadTransactions();
  }

  async function logout() {
    await api.logout();
    window.location.href = '/login';
  }
</script>

<div class="space-y-6">
  <header class="flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-bold text-white">Transações</h1>
      <p class="text-slate-400">Registro financeiro</p>
    </div>
    <div class="flex gap-2">
      <select bind:value={view} onchange={loadTransactions} class="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm">
        <option value="mine">Minhas</option>
        <option value="shared">Compartilhadas</option>
        <option value="all">Todas</option>
      </select>
      <button onclick={() => showForm = !showForm} class="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-sm">
        + Nova
      </button>
      <button onclick={logout} class="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg text-sm">
        Sair
      </button>
    </div>
  </header>

  {#if showForm}
    <form onsubmit={handleSubmit} class="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
      <h2 class="text-lg font-semibold">Nova transação</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <select bind:value={form.type} class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white">
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
        <input type="number" step="0.01" bind:value={form.amount} placeholder="Valor" required class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white" />
        <select bind:value={form.category} class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white">
          <option value="">Categoria</option>
          {#each categories as cat}
            <option value={cat}>{cat}</option>
          {/each}
        </select>
        <select bind:value={form.payment} class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white">
          <option value="debit">Débito</option>
          <option value="credit">Crédito</option>
          <option value="cash">Dinheiro</option>
          <option value="other">Outro</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <input type="date" bind:value={form.date} required class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white" />
        <input type="text" bind:value={form.description} placeholder="Descrição (opcional)" class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white" />
      </div>
      <button type="submit" class="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2 rounded-lg">Salvar</button>
    </form>
  {/if}

  {#if loading}
    <div class="flex justify-center py-8"><span class="text-slate-400">Carregando...</span></div>
  {:else if transactions.length === 0}
    <div class="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
      <p class="text-slate-400">Nenhuma transação encontrada.</p>
    </div>
  {:else}
    <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-700 text-slate-300 text-sm">
          <tr>
            <th class="text-left px-4 py-3">Data</th>
            <th class="text-left px-4 py-3">Categoria</th>
            <th class="text-left px-4 py-3">Pagamento</th>
            <th class="text-right px-4 py-3">Valor</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700">
          {#each transactions as t}
            <tr class="hover:bg-slate-700/50">
              <td class="px-4 py-3 text-sm">{t.date}</td>
              <td class="px-4 py-3 text-sm text-white">{t.category}</td>
              <td class="px-4 py-3 text-sm text-slate-400">{t.payment}</td>
              <td class="px-4 py-3 text-sm text-right {t.type === 'income' ? 'text-green-400' : 'text-red-400'}">
                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>