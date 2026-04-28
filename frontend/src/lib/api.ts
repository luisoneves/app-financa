const API_BASE = '/api';

export interface User {
  name: string;
  role: 'user' | 'mae';
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  payment: 'credit' | 'debit' | 'cash' | 'other';
  description?: string;
  date: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  shared: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  shared: boolean;
}

export const api = {
  async login(username: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login falhou');
    return res.json();
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  async getMe(): Promise<User | null> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
    });
    return res.ok ? res.json() : null;
  },

  async getTransactions(view = 'mine'): Promise<Transaction[]> {
    const res = await fetch(`${API_BASE}/transactions?view=${view}`, {
      credentials: 'include',
    });
    return res.ok ? res.json() : [];
  },

  async createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getEvents(view = 'mine'): Promise<Event[]> {
    const res = await fetch(`${API_BASE}/events?view=${view}`, {
      credentials: 'include',
    });
    return res.ok ? res.json() : [];
  },

  async createEvent(data: Omit<Event, 'id'>): Promise<Event> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getTasks(view = 'mine'): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks?view=${view}`, {
      credentials: 'include',
    });
    return res.ok ? res.json() : [];
  },

  async createTask(data: Omit<Task, 'id'>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateTask(id: string, data: Partial<Task>): Promise<void> {
    await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  async deleteTask(id: string): Promise<void> {
    await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },
};