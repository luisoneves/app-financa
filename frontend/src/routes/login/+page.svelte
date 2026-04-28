<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';

  let username = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);
  let mustChangePassword = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    error = '';

    try {
      const user = await api.login(username, password);
      if (user.mustChangePassword) {
        mustChangePassword = true;
      } else {
        goto('/');
      }
    } catch (err) {
      error = 'Usuário ou senha incorretos';
    } finally {
      loading = false;
    }
  }

  async function handleChangePassword(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newPassword = (form.newPassword as HTMLInputElement).value;
    const confirmPassword = (form.confirmPassword as HTMLInputElement).value;

    if (newPassword !== confirmPassword) {
      error = 'Senhas não coincidem';
      return;
    }

    loading = true;
    error = '';

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: password, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        error = data.error;
      } else {
        goto('/');
      }
    } catch {
      error = 'Erro ao alterar senha';
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    const user = await api.getMe();
    if (user) {
      if (user.mustChangePassword) {
        mustChangePassword = true;
      } else {
        goto('/');
      }
    }
  });
</script>

<div class="flex items-center justify-center min-h-[80vh]">
  {#if mustChangePassword}
    <form onsubmit={handleChangePassword} class="bg-slate-800 rounded-xl p-8 w-full max-w-md border border-slate-700">
      <h1 class="text-2xl font-bold text-white mb-2 text-center">Primeiro Acesso</h1>
      <p class="text-slate-400 text-sm text-center mb-6">Você precisa alterar sua senha</p>

      <div class="text-xs text-slate-500 mb-4 p-3 bg-slate-900 rounded">
        A nova senha deve conter:<br/>
        • 8 ou mais caracteres<br/>
        • Letra maiúscula e minúscula<br/>
        • Número<br/>
        • Caractere especial (!@#$%^&amp;*...)
      </div>

      {#if error}
        <div class="bg-red-900/50 border border-red-700 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label for="newPassword" class="block text-sm text-slate-400 mb-1">Nova Senha</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minlength="8"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-sky-500 focus:outline-none"
          />
        </div>
        <div>
          <label for="confirmPassword" class="block text-sm text-slate-400 mb-1">Confirmar Nova Senha</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minlength="8"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-sky-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          class="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? 'Alterando...' : 'Alterar Senha'}
        </button>
      </div>
    </form>
  {:else}
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
  {/if}
</div>