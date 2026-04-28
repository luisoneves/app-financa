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

      <div class="mt-4">
        <a
          href="/api/auth/google"
          class="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg transition-colors border border-gray-300"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google
        </a>
      </div>
    </form>
  {/if}
</div>