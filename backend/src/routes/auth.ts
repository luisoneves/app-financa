import { Hono } from 'hono';
import { sign, verify } from 'jsonwebtoken';
import { setCookie } from 'hono/cookie';
import type { Env } from 'hono';
import { authRateLimiter, getClientIp } from '../middleware/rate-limit';

const auth = new Hono<{ Bindings: Env }>();

type UserRecord = {
  username: string;
  password: string;
  name: string;
  role: 'user' | 'mae';
  mustChangePassword: boolean;
};

const VALID_USERS: UserRecord[] = [
  {
    username: process.env.USUARIO_1 || 'elissnsilveira',
    password: process.env.SENHA_1 || 'padrao123',
    name: process.env.NOME_1 || 'Elissandra',
    role: 'user',
    mustChangePassword: true,
  },
  {
    username: process.env.USUARIO_2 || 'sarasilveira',
    password: process.env.SENHA_2 || 'padrao123',
    name: process.env.NOME_2 || 'Sara',
    role: 'mae',
    mustChangePassword: true,
  },
  {
    username: process.env.USUARIO_3 || 'sirneysilveira',
    password: process.env.SENHA_3 || 'padrao123',
    name: process.env.NOME_3 || 'Sirney',
    role: 'mae',
    mustChangePassword: true,
  },
  {
    username: process.env.USUARIO_4 || 'luisneves',
    password: process.env.SENHA_4 || 'padrao123',
    name: process.env.NOME_4 || 'Luis',
    role: 'user',
    mustChangePassword: true,
  },
];

const validatePassword = (p: string): boolean => {
  return /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[!@#$%^&*]/.test(p) && p.length >= 8;
};

auth.post('/login', async (c) => {
  const ip = getClientIp(c.req);
  const { allowed, remaining, resetAt } = authRateLimiter.check(ip, 'login');

  if (!allowed) {
    c.res.headers.set('RateLimit-Limit', '5');
    c.res.headers.set('RateLimit-Remaining', '0');
    c.res.headers.set('RateLimit-Reset', String(Math.ceil((resetAt - Date.now()) / 1000)));
    return c.json({ error: 'Muitas tentativas. Aguarde 1 minuto.' }, 429);
  }

  c.res.headers.set('RateLimit-Limit', '5');
  c.res.headers.set('RateLimit-Remaining', String(remaining));
  c.res.headers.set('RateLimit-Reset', String(Math.ceil((resetAt - Date.now()) / 1000)));

  const body = await c.req.json();
  const { username, password } = body;

  const user = VALID_USERS.find((u) => u.username === username && u.password === password);

  if (!user) {
    return c.json({ error: 'Usuário ou senha incorretos' }, 401);
  }

  const secret = process.env.JWT_SECRET || c.env.JWT_SECRET || 'fallback-secret-change-me';
  const token = sign(
    {
      sub: username,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
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

  return c.json({
    name: user.name,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  });
});

auth.post('/change-password', async (c) => {
  const token = c.req.cookie('auth_token');
  if (!token) return c.json({ error: 'Não autenticado' }, 401);

  try {
    const secret = process.env.JWT_SECRET || c.env.JWT_SECRET || 'fallback-secret-change-me';
    const payload = verify(token, secret) as { sub: string; mustChangePassword: boolean };
    const { currentPassword, newPassword } = await c.req.json();

    const user = VALID_USERS.find((u) => u.username === payload.sub);
    if (!user) return c.json({ error: 'Erro interno' }, 500);

    if (user.password !== currentPassword) {
      return c.json({ error: 'Dados incorretos' }, 400);
    }

    if (!validatePassword(newPassword)) {
      return c.json({
        error: 'Senha deve ter: 8+ caracteres, letra maiúscula, minúscula, número e caractere especial',
      }, 400);
    }

    user.password = newPassword;
    user.mustChangePassword = false;

    const newToken = sign(
      { sub: user.username, name: user.name, role: user.role, mustChangePassword: false },
      secret,
      { expiresIn: '7d' }
    );

    setCookie(c, 'auth_token', newToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return c.json({ ok: true });
  } catch {
    return c.json({ error: 'Erro interno' }, 500);
  }
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
    const payload = verify(token, secret) as { name: string; role: string; mustChangePassword: boolean };
    return c.json({ name: payload.name, role: payload.role, mustChangePassword: payload.mustChangePassword });
  } catch {
    return c.json({ error: 'Token inválido' }, 401);
  }
});

export default auth;