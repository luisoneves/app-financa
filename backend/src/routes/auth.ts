import { Hono } from 'hono';
import { sign, verify } from 'jsonwebtoken';
import { setCookie } from 'hono/cookie';
import type { Env } from 'hono';
import { authRateLimiter, getClientIp } from '../middleware/rate-limit';

const auth = new Hono<{ Bindings: Env }>();

type GoogleUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

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

auth.get('/google', (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return c.json({ error: 'Google OAuth não configurado' }, 500);
  }

  const scopes = ['openid', 'email', 'profile'];
  const state = Math.random().toString(36).substring(7);

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'offline');

  return c.redirect(authUrl.toString());
});

auth.get('/google/callback', async (c) => {
  const code = c.req.query('code');
  const error = c.req.query('error');

  if (error) {
    return c.json({ error: `Google OAuth error: ${error}` }, 400);
  }

  if (!code) {
    return c.json({ error: 'Código de autorização não fornecido' }, 400);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return c.json({ error: 'Google OAuth não configurado' }, 500);
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return c.json({ error: `Falha ao obter token: ${errorData.error}` }, 400);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    const userResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) {
      return c.json({ error: 'Falha ao obter dados do usuário' }, 400);
    }

    const googleUser: GoogleUser = await userResponse.json();

    const secret = process.env.JWT_SECRET || c.env.JWT_SECRET || 'fallback-secret-change-me';

    const existingUser = VALID_USERS.find((u) => u.username === googleUser.email);

    let userRecord;
    if (existingUser) {
      userRecord = existingUser;
    } else {
      userRecord = {
        username: googleUser.email,
        password: '',
        name: googleUser.name,
        role: 'user' as const,
        mustChangePassword: false,
      };
    }

    const token = sign(
      {
        sub: userRecord.username,
        name: userRecord.name,
        role: userRecord.role,
        mustChangePassword: userRecord.mustChangePassword,
        provider: 'google',
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

    return c.redirect('/');
  } catch (err) {
    console.error('Google OAuth error:', err);
    return c.json({ error: 'Erro interno no Google OAuth' }, 500);
  }
});

export default auth;