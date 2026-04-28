<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';

  let user = $state<{ name: string; role: string } | null>(null);
  let transactions = $state<{ type: string; amount: number; category: string }[]>([]);
  let loading = $state(true);

  onMount(async () => {
    user = await api.getMe();
    if (!user) {
      goto('/login');
      return;
    }
    transactions = await api.getTransactions('mine');
    loading = false;
  });

  const totalIncome = $derived(
    transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  );

  const totalExpense = $derived(
    transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  );

  const balance = $derived(totalIncome - totalExpense);

  const byCategory = $derived(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      const val = map.get(t.category) || 0;
      map.set(t.category, val + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  });
</script>

{#if loading}
  <div class="flex items-center justify-center h-64">
    <span class="text-slate-400">Carregando...</span>
  </div>
{:else if user}
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">Olá, {user.name}</h1>
      <p class="text-slate-400">Resumo do período</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <p class="text-sm text-slate-400">Receitas</p>
        <p class="text-2xl font-bold text-green-400">R$ {totalIncome.toFixed(2)}</p>
      </div>
      <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <p class="text-sm text-slate-400">Despesas</p>
        <p class="text-2xl font-bold text-red-400">R$ {totalExpense.toFixed(2)}</p>
      </div>
      <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <p class="text-sm text-slate-400">Saldo</p>
        <p class="text-2xl font-bold {balance >= 0 ? 'text-green-400' : 'text-red-400'}">
          R$ {balance.toFixed(2)}
        </p>
      </div>
    </div>

    <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 class="text-lg font-semibold mb-4">Transações recentes</h2>
      {#if transactions.length === 0}
        <p class="text-slate-400">Nenhuma transação registrada.</p>
      {:else}
        <div class="space-y-2">
          {#each transactions.slice(0, 5) as t}
            <div class="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
              <div>
                <p class="text-white">{t.category}</p>
                <p class="text-xs text-slate-400">{t.date}</p>
              </div>
              <span class="{t.type === 'income' ? 'text-green-400' : 'text-red-400'}">
                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
              </span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}