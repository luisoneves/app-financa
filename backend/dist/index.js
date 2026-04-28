import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', cors({ origin: '*', credentials: true }));
app.use('*', logger());

app.get('/health', (c) => c.json({ ok: true, timestamp: Date.now() }));

app.get('/api/auth/login', (c) => c.json({ method: 'GET not allowed, use POST' }, 405));
app.post('/api/auth/login', async (c) => {
  const body = await c.req.json();
  const { username, password } = body;
  
  const users = {
    elissnsilveira: { password: 'padrao123', name: 'Elissandra', role: 'user' },
    sarasilvee: { password: 'padrao123', name: 'Sara', role: 'mae' },
    sirneysilvee: { password: 'padrao123', name: 'Sirney', role: 'mae' },
    luisneves: { password: 'padrao123', name: 'Luis', role: 'user' },
  };

  const user = users[username];
  if (!user || user.password !== password) {
    return c.json({ error: 'Usuário ou senha incorretos' }, 401);
  }

  return c.json({ name: user.name, role: user.role, mustChangePassword: true });
});

app.onError((err, c) => {
  console.error('Error:', err.message);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;