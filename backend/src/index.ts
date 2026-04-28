import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import eventRoutes from './routes/events';
import taskRoutes from './routes/tasks';
import type { Env } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use('*', logger());

app.get('/health', (c) => c.json({ ok: true, timestamp: Date.now() }));

app.route('/api/auth', authRoutes);
app.route('/api/transactions', transactionRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/tasks', taskRoutes);

app.onError((err, c) => {
  console.error('Error:', err.message);
  return c.json({ error: err.message || 'Internal Server Error' }, 500);
});

export default app;