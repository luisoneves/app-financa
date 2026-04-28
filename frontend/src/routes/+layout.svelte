<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';

  let { children } = $props();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/transacoes', label: 'Transações' },
    { href: '/calendario', label: 'Calendário' },
    { href: '/tarefas', label: 'Tarefas' },
  ];
</script>

<div class="min-h-screen flex flex-col">
  <nav class="bg-slate-800 border-b border-slate-700 px-4 py-3">
    <div class="flex items-center justify-between max-w-6xl mx-auto">
      <span class="text-lg font-semibold text-sky-400">app-financa</span>
      <div class="flex gap-6">
        {#each navItems as item}
          <a
            href={item.href}
            class="text-sm {$page.url.pathname === item.href
              ? 'text-sky-400'
              : 'text-slate-400 hover:text-white'} transition-colors"
          >
            {item.label}
          </a>
        {/each}
      </div>
    </div>
  </nav>

  <main class="flex-1 p-4">
    <div class="max-w-6xl mx-auto">
      {@render children()}
    </div>
  </main>
</div>