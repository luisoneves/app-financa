<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';

  let events = $state<{ id: string; title: string; date: string; time?: string; shared: boolean }[]>([]);
  let view = $state<'mine' | 'shared' | 'all'>('mine');
  let loading = $state(true);
  let showForm = $state(false);

  let form = $state({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    shared: false,
  });

  onMount(async () => {
    await loadEvents();
  });

  async function loadEvents() {
    loading = true;
    events = await api.getEvents(view);
    loading = false;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    await api.createEvent(form);
    showForm = false;
    form = { title: '', date: new Date().toISOString().split('T')[0], time: '', shared: false };
    await loadEvents();
  }

  const calendarDays = $derived(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return { days, year, month };
  });

  const eventsByDay = $derived(() => {
    const map = new Map<string, typeof events>();
    events.forEach((e) => {
      const existing = map.get(e.date) || [];
      map.set(e.date, [...existing, e]);
    });
    return map;
  });
</script>

<div class="space-y-6">
  <header class="flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-bold text-white">Calendário</h1>
      <p class="text-slate-400">Eventos e datas</p>
    </div>
    <div class="flex gap-2">
      <select bind:value={view} onchange={loadEvents} class="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm">
        <option value="mine">Minhas</option>
        <option value="shared">Compartilhadas</option>
        <option value="all">Todas</option>
      </select>
      <button onclick={() => showForm = !showForm} class="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-sm">
        + Novo
      </button>
    </div>
  </header>

  {#if showForm}
    <form onsubmit={handleSubmit} class="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
      <h2 class="text-lg font-semibold">Novo evento</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="text" bind:value={form.title} placeholder="Título do evento" required class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white" />
        <input type="date" bind:value={form.date} required class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white" />
        <input type="time" bind:value={form.time} placeholder="Hora (opcional)" class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white" />
      </div>
      <label class="flex items-center gap-2">
        <input type="checkbox" bind:checked={form.shared} class="w-4 h-4" />
        <span class="text-sm text-slate-300">Compartilhar com {form.shared ? '👤' : '👥'}</span>
      </label>
      <button type="submit" class="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2 rounded-lg">Salvar</button>
    </form>
  {/if}

  <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
    <div class="text-center mb-4">
      <h2 class="text-xl font-semibold">
        {new Date(calendarDays().year, calendarDays().month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
      </h2>
    </div>
    <div class="grid grid-cols-7 gap-1">
      {#each ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as day}
        <div class="text-center text-xs text-slate-400 py-2">{day}</div>
      {/each}
      {#each calendarDays().days as day}
        {#if day === null}
          <div></div>
        {:else}
          {@const dateStr = `${calendarDays().year}-${String(calendarDays().month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
          {@const dayEvents = eventsByDay().get(dateStr) || []}
          <div class="bg-slate-700 rounded-lg p-2 min-h-[60px] {day === new Date().getDate() ? 'ring-2 ring-sky-500' : ''}">
            <div class="text-sm font-semibold {day === new Date().getDate() ? 'text-sky-400' : 'text-white'}">{day}</div>
            {#each dayEvents.slice(0, 2) as e}
              <div class="text-xs bg-sky-900 text-sky-300 rounded px-1 mt-1 truncate">{e.title}</div>
            {/each}
            {#if dayEvents.length > 2}
              <div class="text-xs text-slate-400 mt-1">+{dayEvents.length - 2}</div>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  </div>
</div>