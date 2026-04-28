<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';

  let username = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    error = '';

    try {
      await api.login(username, password);
      goto('/');
    } catch (err) {
      error = 'Usuário ou senha incorretos';
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    const user = await api.getMe();
    if (user) goto('/');
  });
</script>

<div class="flex items-center justify-center min-h-[80vh]">
  <form onsubmit={handleSubmit} class="bg-slate-800 rounded-xl p-8 w-full max-w-md border border-slate-700">
    <h1 class="text-2xl font-bold text-white mb-6 text-center">Entrar</h1>

    {#if error}
      <div class="bg-red-900/50 border border-red-700 text-red-400 rounded-lg px-4 py-3 mb-4">
        {error}
      </div>
    {/if}

    <div class="space-y-4">
      <div>
        <label for="username" class="block text-sm text-slate-400 mb-1">Usuário</label>
        <input
          id="username"
          type="text"
          bind:value={username}
          required
          class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-sky-500 focus:outline-none"
        />
      </div>

      <div>
        <label for="password" class="block text-sm text-slate-400 mb-1">Senha</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-sky-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </div>
  </form>
</div>