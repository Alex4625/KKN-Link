// server/routes/items.ts — Route CRUD item (link, note, secret) + reveal
// Sesuai PRD bagian 4, 5.1, 7.4, 10.2, 10.3
import { Hono } from 'hono';
import { eq, asc, desc } from 'drizzle-orm';
import { createDb } from '../db/client';
import { items, categories } from '../db/schema';
import { createItemSchema, updateItemSchema } from '../lib/validation';
import { encryptSecret, decryptSecret } from '../lib/crypto';
import { ok, err } from '../lib/response';
import type { AppEnv } from '../app';

const itemsRoute = new Hono<AppEnv>();

/** GET /api/items — Semua item, TANPA secret_payload */
itemsRoute.get('/', async (c) => {
  const db = createDb(c.env.DB);
  const rows = await db.select({
    id: items.id,
    categoryId: items.categoryId,
    type: items.type,
    title: items.title,
    description: items.description,
    url: items.url,
    content: items.content,
    // secret_payload sengaja TIDAK disertakan
    isPinned: items.isPinned,
    sortOrder: items.sortOrder,
    createdAt: items.createdAt,
    updatedAt: items.updatedAt,
  })
  .from(items)
  .orderBy(desc(items.isPinned), asc(items.sortOrder), asc(items.createdAt));

  return c.json(ok(rows));
});

/** POST /api/items — Tambah item baru */
itemsRoute.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = createItemSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues?.[0]?.message || (parsed.error as any).errors?.[0]?.message || 'Validasi gagal';
    return c.json(err(message), 400);
  }

  const db = createDb(c.env.DB);
  const data = parsed.data;

  // Verifikasi category_id ada (jika diberikan)
  if (data.categoryId) {
    const cat = await db.select().from(categories).where(eq(categories.id, data.categoryId));
    if (cat.length === 0) {
      return c.json(err('Kategori tidak ditemukan'), 400);
    }
  }

  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  let url: string | null = null;
  let description: string | null = null;
  let content: string | null = null;
  let secretPayload: string | null = null;

  if (data.type === 'link') {
    url = data.url;
    description = data.description || null;
  } else if (data.type === 'note') {
    content = data.content;
  } else if (data.type === 'secret') {
    // Enkripsi username dan password
    const payload = JSON.stringify({ username: data.username || '', password: data.password });
    secretPayload = await encryptSecret(payload, c.env.SECRET_ENC_KEY);
  }

  await db.insert(items).values({
    id,
    categoryId: data.categoryId || null,
    type: data.type,
    title: data.title,
    description,
    url,
    content,
    secretPayload,
    isPinned: data.isPinned ? 1 : 0,
    sortOrder: data.sortOrder || 0,
    createdAt: now,
    updatedAt: now,
  });

  // Return tanpa secret_payload
  return c.json(ok({
    id,
    categoryId: data.categoryId || null,
    type: data.type,
    title: data.title,
    description,
    url,
    content,
    isPinned: data.isPinned ? 1 : 0,
    sortOrder: data.sortOrder || 0,
    createdAt: now,
    updatedAt: now,
  }, 'Item berhasil ditambahkan'), 201);
});

/** PATCH /api/items/:id — Ubah item */
itemsRoute.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues?.[0]?.message || (parsed.error as any).errors?.[0]?.message || 'Validasi gagal';
    return c.json(err(message), 400);
  }

  const db = createDb(c.env.DB);

  // Cek item ada
  const existing = await db.select().from(items).where(eq(items.id, id));
  if (existing.length === 0) {
    return c.json(err('Item sudah tidak ada.'), 404);
  }

  const item = existing[0];
  const data = parsed.data;
  const now = Math.floor(Date.now() / 1000);

  const updateData: Record<string, unknown> = { updatedAt: now };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.isPinned !== undefined) updateData.isPinned = data.isPinned ? 1 : 0;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

  if (item.type === 'link') {
    if (data.url !== undefined) updateData.url = data.url;
    if (data.description !== undefined) updateData.description = data.description;
  } else if (item.type === 'note') {
    if (data.content !== undefined) updateData.content = data.content;
  } else if (item.type === 'secret') {
    // Untuk secret: jika password tidak diisi, pertahankan password lama
    if (data.password || data.username !== undefined) {
      let username = data.username ?? '';
      let password = data.password ?? '';

      // Jika password kosong, dekripsi yang lama dan pakai ulang
      if (!data.password && item.secretPayload) {
        try {
          const old = JSON.parse(await decryptSecret(item.secretPayload, c.env.SECRET_ENC_KEY));
          password = old.password || '';
          if (data.username === undefined) username = old.username || '';
        } catch {
          return c.json(err('Isi rahasia tidak bisa dibuka.'), 500);
        }
      }

      const payload = JSON.stringify({ username, password });
      updateData.secretPayload = await encryptSecret(payload, c.env.SECRET_ENC_KEY);
    }
  }

  await db.update(items).set(updateData).where(eq(items.id, id));

  const updated = await db.select({
    id: items.id,
    categoryId: items.categoryId,
    type: items.type,
    title: items.title,
    description: items.description,
    url: items.url,
    content: items.content,
    isPinned: items.isPinned,
    sortOrder: items.sortOrder,
    createdAt: items.createdAt,
    updatedAt: items.updatedAt,
  }).from(items).where(eq(items.id, id));

  return c.json(ok(updated[0], 'Item berhasil diubah'));
});

/** DELETE /api/items/:id — Hapus item */
itemsRoute.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const db = createDb(c.env.DB);

  const existing = await db.select().from(items).where(eq(items.id, id));
  if (existing.length === 0) {
    return c.json(err('Item sudah tidak ada.'), 404);
  }

  await db.delete(items).where(eq(items.id, id));
  return c.json(ok(null, 'Item berhasil dihapus'));
});

/** GET /api/items/:id/reveal — Dekripsi dan kembalikan username & password untuk item secret */
itemsRoute.get('/:id/reveal', async (c) => {
  const id = c.req.param('id');
  const db = createDb(c.env.DB);

  const existing = await db.select().from(items).where(eq(items.id, id));
  if (existing.length === 0) {
    return c.json(err('Item sudah tidak ada.'), 404);
  }

  const item = existing[0];
  if (item.type !== 'secret') {
    return c.json(err('Item bukan tipe rahasia'), 400);
  }

  if (!item.secretPayload) {
    return c.json(err('Isi rahasia tidak bisa dibuka.'), 500);
  }

  try {
    const decrypted = JSON.parse(await decryptSecret(item.secretPayload, c.env.SECRET_ENC_KEY));
    return c.json(ok({ username: decrypted.username || '', password: decrypted.password || '' }));
  } catch {
    // Jangan log isi rahasia
    return c.json(err('Isi rahasia tidak bisa dibuka.'), 500);
  }
});

export default itemsRoute;
