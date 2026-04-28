import type { Context } from 'hono';
import { verify } from 'jsonwebtoken';
import { getCookie } from 'hono/cookie';

export interface AuthPayload {
  sub: string;
  name: string;
  role: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthPayload;
  }
}

export const getAuth = (c: Context): AuthPayload | null => {
  const token = getCookie(c, 'auth_token');
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET || c.env.JWT_SECRET;
    return verify(token, secret) as AuthPayload;
  } catch {
    return null;
  }
};

export const requireAuth = (c: Context): AuthPayload => {
  const auth = getAuth(c);
  if (!auth) {
    throw new Error('Unauthorized');
  }
  return auth;
};