// server/middleware/auth.ts — Middleware autentikasi cookie sesi bertanda tangan
// Sesuai PRD bagian 10.1
import { Context, Next } from 'hono';
import { getSignedCookie } from 'hono/cookie';
import type { AppEnv } from '../app';

const COOKIE_NAME = 'kkn_session';

/** Middleware: cek cookie sesi bertanda tangan. Lewati /api/auth/login. */
export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  // Lewati preflight OPTIONS CORS
  if (c.req.method === 'OPTIONS') {
    return next();
  }

  const path = new URL(c.req.url).pathname;

  // Lewati endpoint login
  if (path === '/api/auth/login') {
    return next();
  }

  const session = await getSignedCookie(c, c.env.SESSION_SECRET, COOKIE_NAME);

  if (!session) {
    return c.json({ success: false, data: null, message: 'Sesi tidak valid' }, 401);
  }

  return next();
}

/** Tambahkan header keamanan ke semua response API */
export async function securityHeaders(c: Context, next: Next) {
  await next();
  c.header('Cache-Control', 'no-store');
  c.header('X-Robots-Tag', 'noindex');
}
