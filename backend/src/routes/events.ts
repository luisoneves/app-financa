import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from '../middleware/auth';

const events = new Hono();

events.get('/', async (c) => {
  const auth = getAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const view = c.req.query('view') || 'mine';
  let query = 'SELECT * FROM events WHERE ';

  if (view === 'mine') {
    query += 'user_id = ?';
  } else if (view === 'shared') {
    query += 'shared = 1 AND user_id != ?';
  } else {
    query += '(user_id = ? OR shared = 1)';
  }

  query += ' ORDER BY date ASC';

  const stmt = c.env.d1.prepare(query).bind(auth.sub);
  const results = view === 'shared'
    ? await c.env.d1.prepare(query).bind(auth.sub).all()
    : await stmt.all();

  return c.json(results.results);
});

events.post('/', async (c) => {
  const auth = getAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const id = uuidv4();

  await c.env.d1
    .prepare(
      `INSERT INTO events (id, user_id, title, date, time, shared, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, auth.sub, body.title, body.date, body.time || null, body.shared ? 1 : 0, Date.now())
    .run();

  return c.json({ id, ...body }, 201);
});

events.delete('/:id', async (c) => {
  const auth = getAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { id } = c.req.param();
  await c.env.d1
    .prepare('DELETE FROM events WHERE id = ? AND user_id = ?')
    .bind(id, auth.sub)
    .run();

  return c.json({ ok: true });
});

export default events;