<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';

  let tasks = $state<{
    id: string;
    title: string;
    status: 'todo' | 'doing' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    shared: boolean;
  }[]>([]);
  let view = $state<'mine' | 'shared' | 'all'>('mine');
  let loading = $state(true);
  let showForm = $state(false);

  let form = $state({
    title: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    shared: false,
  });

  onMount(async () => {
    await loadTasks();
  });

  async function loadTasks() {
    loading = true;
    tasks = await api.getTasks(view);
    loading = false;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    await api.createTask({ ...form, status: 'todo' });
    showForm = false;
    form = { title: '', priority: 'medium', dueDate: '', shared: false };
    await loadTasks();
  }

  async function moveTask(id: string, status: 'todo' | 'doing' | 'done') {
    await api.updateTask(id, { status });
    await loadTasks();
  }

  async function deleteTask(id: string) {
    await api.deleteTask(id);
    await loadTasks();
  }

  const columns: { id: 'todo' | 'doing' | 'done'; label: string; color: string }[] = [
    { id: 'todo', label: 'A Fazer', color: 'slate' },
    { id: 'doing', label: 'Em Progresso', color: 'sky' },
    { id: 'done', label: 'Concluído', color: 'green' },
  ];
</script>

<div class="space-y-6">
  <header class="flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-bold text-white">Tarefas</h1>
      <p class="text-slate-400">Kanban</p>
    </div>
    <div class="flex gap-2">
      <select bind:value={view} onchange={loadTasks} class="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm">
        <option value="mine">Minhas</option>
        <option value="shared">Compartilhadas</option>
        <option value="all">Todas</option>
      </select>
      <button onclick={() => showForm = !showForm} class="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-sm">
        + Nova
      </button>
    </div>
  </header>

  {#if showForm}
    <form onsubmit={handleSubmit} class="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
      <h2 class="text-lg font-semibold">Nova tarefa</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input type="text" bind:value={form.title} placeholder="Título" required class="md:col-span-2 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white" />
        <select bind:value={form.priority} class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white">
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
        <input type="date" bind:value={form.dueDate} class="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white" />
      </div>
      <label class="flex items-center gap-2">
        <input type="checkbox" bind:checked={form.shared} class="w-4 h-4" />
        <span class="text-sm text-slate-300">Compartilhar</span>
      </label>
      <button type="submit" class="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2 rounded-lg">Salvar</button>
    </form>
  {/if}

  {#if loading}
    <div class="flex justify-center py-8"><span class="text-slate-400">Carregando...</span></div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {#each columns as col}
        {@const colTasks = tasks.filter((t) => t.status === col.id)}
        <div class="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 class="text-sm font-semibold text-slate-400 mb-3 uppercase">{col.label} ({colTasks.length})</h3>
          <div class="space-y-2">
            {#each colTasks as task}
              <div class="bg-slate-700 rounded-lg p-3 {task.shared ? 'border-l-4 border-l-sky-500' : ''}">
                <div class="flex justify-between items-start gap-2">
                  <p class="text-sm text-white">{task.title}</p>
                  {#if task.priority === 'high'}
                    <span class="text-xs bg-red-900 text-red-400 px-2 py-0.5 rounded">!</span>
                  {/if}
                </div>
                {#if task.dueDate}
                  <p class="text-xs text-slate-400 mt-1">{task.dueDate}</p>
                {/if}
                <div class="flex gap-2 mt-2">
                  {#if col.id !== 'todo'}
                    <button onclick={() => moveTask(task.id, col.id === 'doing' ? 'todo' : 'doing')} class="text-xs text-slate-400 hover:text-white">←</button>
                  {/if}
                  {#if col.id !== 'done'}
                    <button onclick={() => moveTask(task.id, col.id === 'todo' ? 'doing' : 'done')} class="text-xs text-slate-400 hover:text-white">→</button>
                  {/if}
                  <button onclick={() => deleteTask(task.id)} class="text-xs text-red-400 hover:text-red-300 ml-auto">×</button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>