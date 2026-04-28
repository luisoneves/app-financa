import { Hono } from 'hono';
import { getAuth } from '../middleware/auth';

const tasks = new Hono();

tasks.get('/', async (c) => {
  const auth = getAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const view = c.req.query('view') || 'mine';
  let query = 'SELECT * FROM tasks WHERE ';

  if (view === 'mine') {
    query += 'user_id = ?';
  } else if (view === 'shared') {
    query += 'shared = 1 AND user_id != ?';
  } else {
    query += '(user_id = ? OR shared = 1)';
  }

  query += ' ORDER BY due_date ASC';

  const results = await c.env.d1.prepare(query).bind(auth.sub).all();

  return c.json(results.results);
});

tasks.post('/', async (c) => {
  const auth = getAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const id = crypto.randomUUID();

  await c.env.d1
    .prepare(
      `INSERT INTO tasks (id, user_id, title, status, priority, due_date, shared, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      auth.sub,
      body.title,
      body.status || 'todo',
      body.priority || 'medium',
      body.dueDate || null,
      body.shared ? 1 : 0,
      Date.now()
    )
    .run();

  return c.json({ id, ...body }, 201);
});

tasks.patch('/:id', async (c) => {
  const auth = getAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { id } = c.req.param();
  const body = await c.req.json();

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title); }
  if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status); }
  if (body.priority !== undefined) { fields.push('priority = ?'); values.push(body.priority); }
  if (body.dueDate !== undefined) { fields.push('due_date = ?'); values.push(body.dueDate); }
  if (body.shared !== undefined) { fields.push('shared = ?'); values.push(body.shared ? 1 : 0); }

  if (fields.length === 0) return c.json({ error: 'No fields to update' }, 400);

  values.push(id, auth.sub);
  const result = await c.env.d1
    .prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`)
    .bind(...values)
    .run();

  return c.json({ ok: result.success });
});

tasks.delete('/:id', async (c) => {
  const auth = getAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { id } = c.req.param();
  await c.env.d1
    .prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
    .bind(id, auth.sub)
    .run();

  return c.json({ ok: true });
});

export default tasks;