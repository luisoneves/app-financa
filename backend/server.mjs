import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from './src/routes/auth.js';
import transactionRoutes from './src/routes/transactions.js';
import eventRoutes from './src/routes/events.js';
import taskRoutes from './src/routes/tasks.js';
import { RateLimiter, getClientIp } from './src/middleware/rate-limit.js';

const authRateLimiter = new RateLimiter(60 * 1000, 5);

const app = new Hono();

app.use('*', cors({ origin: 'http://localhost:5173', credentials: true }));
app.use('*', logger());

app.get('/health', (c) => c.json({ ok: true }));

app.post('/api/auth/login', async (c) => {
  const ip = getClientIp(c);
  const { allowed, remaining, resetAt } = authRateLimiter.check(ip, 'login');

  if (!allowed) {
    c.res.headers.set('RateLimit-Limit', '5');
    c.res.headers.set('RateLimit-Remaining', '0');
    c.res.headers.set('RateLimit-Reset', String(Math.ceil((resetAt - Date.now()) / 1000)));
    return c.json({ error: 'Muitas tentativas. Aguarde 1 minuto.' }, 429);
  }

  c.res.headers.set('RateLimit-Limit', '5');
  c.res.headers.set('RateLimit-Remaining', String(remaining));

  const body = await c.req.json();
  const { username, password } = body;

  const users = [
    { username: 'elissnsilveira', password: 'padrao123', name: 'Elissandra', role: 'user' },
    { username: 'sarasilvee', password: 'padrao123', name: 'Sara', role: 'mae' },
    { username: 'sirneysilvee', password: 'padrao123', name: 'Sirney', role: 'mae' },
    { username: 'luisneves', password: 'padrao123', name: 'Luis', role: 'user' },
  ];

  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return c.json({ error: 'Usuário ou senha incorretos' }, 401);

  return c.json({ name: user.name, role: user.role, mustChangePassword: true });
});

app.all('/api/*', async (c) => {
  const token = c.req.cookie('auth_token');
  if (!token) return c.json({ error: 'Não autenticado' }, 401);
  return c.json({ error: 'Not implemented' }, 501);
});

console.log('🚀 Server running on http://localhost:3000');
serve(app);