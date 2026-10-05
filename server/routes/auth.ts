// server/routes/auth.ts — Route autentikasi: login, logout, cek sesi
// Sesuai PRD bagian 3, 7.4, 10.1, dan 12
import { Hono } from 'hono';
import { setSignedCookie, getSignedCookie, deleteCookie } from 'hono/cookie';
import { eq, and, gt, lt } from 'drizzle-orm';
import { createDb } from '../db/client';
import { loginAttempts } from '../db/schema';
import { loginSchema } from '../lib/validation';
import { ok, err } from '../lib/response';
import type { AppEnv } from '../app';

const auth = new Hono<AppEnv>();
const COOKIE_NAME = 'kkn_session';
const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60; // 15 menit
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 hari
const CLEANUP_AGE = 24 * 60 * 60; // 1 hari

/** Bandingkan dua string secara waktu konstan via SHA-256 */
async function constantTimeCompare(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  const viewA = new Uint8Array(hashA);
  const viewB = new Uint8Array(hashB);
  if (viewA.length !== viewB.length) return false;
  let result = 0;
  for (let i = 0; i < viewA.length; i++) {
    result |= viewA[i] ^ viewB[i];
  }
  return result === 0;
}

/** POST /api/auth/login — Validasi kode akses, set cookie sesi */
auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(err('Kode akses wajib diisi'), 400);
  }

  const db = createDb(c.env.DB);
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || '0.0.0.0';
  const now = Math.floor(Date.now() / 1000);

  // Bersihkan percobaan lama (lebih dari 1 hari)
  await db.delete(loginAttempts).where(
    lt(loginAttempts.attemptedAt, now - CLEANUP_AGE)
  );

  // Cek pembatasan percobaan
  const recentAttempts = await db
    .select()
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.ip, ip),
        gt(loginAttempts.attemptedAt, now - WINDOW_SECONDS)
      )
    );

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return c.json(err('Terlalu banyak percobaan. Coba lagi dalam beberapa menit.'), 429);
  }

  // Bandingkan kode akses secara waktu konstan
  const isValid = await constantTimeCompare(parsed.data.code, c.env.ACCESS_CODE);

  if (!isValid) {
    // Catat percobaan gagal
    await db.insert(loginAttempts).values({ ip, attemptedAt: now });
    return c.json(err('Kode akses salah.'), 401);
  }

  // Set cookie sesi bertanda tangan
  const isSecure = c.req.url.startsWith('https');
  await setSignedCookie(c, COOKIE_NAME, 'authenticated', c.env.SESSION_SECRET, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return c.json(ok(null, 'Berhasil masuk'));
});

/** POST /api/auth/logout — Hapus cookie sesi */
auth.post('/logout', async (c) => {
  deleteCookie(c, COOKIE_NAME, { path: '/' });
  return c.json(ok(null, 'Berhasil keluar'));
});

/** GET /api/auth/me — Cek sesi valid */
auth.get('/me', async (c) => {
  const session = await getSignedCookie(c, c.env.SESSION_SECRET, COOKIE_NAME);
  if (!session) {
    return c.json(err('Sesi tidak valid'), 401);
  }
  return c.json(ok(null, 'Sesi valid'));
});

export default auth;
