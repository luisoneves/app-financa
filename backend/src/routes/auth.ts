import { Hono } from 'hono';
import { sign } from 'jsonwebtoken';
import { setCookie } from 'hono/cookie';
import type { Env } from 'hono';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/login', async (c) => {
  const body = await c.req.json();
  const { username, password } = body;

  const validUsers = [
    {
      username: process.env.USUARIO_PRINCIPAL,
      password: process.env.SENHA_PRINCIPAL,
      name: process.env.NOME_PRINCIPAL,
      role: 'user',
    },
    {
      username: process.env.USUARIO_MAE,
      password: process.env.SENHA_MAE,
      name: process.env.NOME_MAE,
      role: 'mae',
    },
  ];

  const user = validUsers.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return c.json({ error: 'Credenciais inválidas' }, 401);
  }

  const secret = process.env.JWT_SECRET || c.env.JWT_SECRET || 'fallback-secret-change-me';
  const token = sign(
    { sub: username, name: user.name, role: user.role },
    secret,
    { expiresIn: '7d' }
  );

  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return c.json({ name: user.name, role: user.role });
});

auth.post('/logout', (c) => {
  setCookie(c, 'auth_token', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return c.json({ ok: true });
});

auth.get('/me', async (c) => {
  const token = c.req.cookie('auth_token');
  if (!token) {
    return c.json({ error: 'Não autenticado' }, 401);
  }
  try {
    const secret = process.env.JWT_SECRET || c.env.JWT_SECRET || 'fallback-secret-change-me';
    const { verify: verifyJwt } = await import('jsonwebtoken');
    const payload = verifyJwt(token, secret) as { name: string; role: string };
    return c.json({ name: payload.name, role: payload.role });
  } catch {
    return c.json({ error: 'Token inválido' }, 401);
  }
});

export default auth;