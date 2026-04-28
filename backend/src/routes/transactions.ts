import { Hono } from 'hono';
import { z } from 'zod';
import { getAuth } from '../middleware/auth';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  category: z.string().min(1),
  payment: z.enum(['credit', 'debit', 'cash', 'other']),
  description: z.string().optional(),
  date: z.string(),
});

const transactions = new Hono();

transactions.get('/', async (c) => {
  const auth = getAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const period = c.req.query('period') || 'all';
  const { d1 } = c.env;

  let query = 'SELECT * FROM transactions WHERE user_id = ?';
  let bindings = [auth.sub];

  const now = new Date();
  if (period === 'day') {
    const today = now.toISOString().split('T')[0];
    query += ' AND date = ?';
    bindings.push(today);
  } else if (period === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    query += ' AND date >= ?';
    bindings.push(weekAgo);
  } else if (period === 'month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    query += ' AND date >= ?';
    bindings.push(monthStart);
  }

  query += ' ORDER BY date DESC';

  const results = await d1.prepare(query).bind(...bindings).all();
  return c.json(results.results);
});

transactions.post('/', async (c) => {
  const auth = getAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const data = transactionSchema.parse(body);

  const id = crypto.randomUUID();
  await c.env.d1
    .prepare(
      `INSERT INTO transactions (id, user_id, type, amount, category, payment, description, date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, auth.sub, data.type, data.amount, data.category, data.payment, data.description || '', data.date, Date.now())
    .run();

  return c.json({ id, ...data }, 201);
});

transactions.get('/:id', async (c) => {
  const auth = getAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { id } = c.req.param();
  const result = await c.env.d1
    .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
    .bind(id, auth.sub)
    .first();

  if (!result) return c.json({ error: 'Not found' }, 404);
  return c.json(result);
});

transactions.delete('/:id', async (c) => {
  const auth = getAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { id } = c.req.param();
  await c.env.d1
    .prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?')
    .bind(id, auth.sub)
    .run();

  return c.json({ ok: true });
});

export default transactions;