// server/routes/categories.ts — Route CRUD kategori
// Sesuai PRD bagian 4 (US-010), 7.4, 10.2
import { Hono } from 'hono';
import { eq, asc, sql } from 'drizzle-orm';
import { createDb } from '../db/client';
import { categories, items } from '../db/schema';
import { categorySchema, categoryUpdateSchema } from '../lib/validation';
import { ok, err } from '../lib/response';
import type { AppEnv } from '../app';

const categoriesRoute = new Hono<AppEnv>();

/** GET /api/categories — Daftar semua kategori terurut */
categoriesRoute.get('/', async (c) => {
  const db = createDb(c.env.DB);
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.createdAt));
  return c.json(ok(rows));
});

/** POST /api/categories — Tambah kategori baru */
categoriesRoute.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues?.[0]?.message || (parsed.error as any).errors?.[0]?.message || 'Validasi gagal';
    return c.json(err(message), 400);
  }

  const db = createDb(c.env.DB);

  // Cek nama unik (case-insensitive)
  const existing = await db.select().from(categories)
    .where(sql`lower(${categories.name}) = lower(${parsed.data.name})`);
  if (existing.length > 0) {
    return c.json(err('Nama kategori sudah dipakai.'), 409);
  }

  const id = crypto.randomUUID();
  await db.insert(categories).values({
    id,
    name: parsed.data.name,
  });

  const created = await db.select().from(categories).where(eq(categories.id, id));
  return c.json(ok(created[0], 'Kategori berhasil ditambahkan'), 201);
});

/** PATCH /api/categories/:id — Ubah nama atau urutan kategori */
categoriesRoute.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues?.[0]?.message || (parsed.error as any).errors?.[0]?.message || 'Validasi gagal';
    return c.json(err(message), 400);
  }

  const db = createDb(c.env.DB);

  // Cek kategori ada
  const existing = await db.select().from(categories).where(eq(categories.id, id));
  if (existing.length === 0) {
    return c.json(err('Kategori tidak ditemukan'), 404);
  }

  // Cek nama unik jika berubah
  if (parsed.data.name) {
    const duplicate = await db.select().from(categories)
      .where(sql`lower(${categories.name}) = lower(${parsed.data.name}) AND ${categories.id} != ${id}`);
    if (duplicate.length > 0) {
      return c.json(err('Nama kategori sudah dipakai.'), 409);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.sortOrder !== undefined) updateData.sortOrder = parsed.data.sortOrder;

  if (Object.keys(updateData).length > 0) {
    await db.update(categories).set(updateData).where(eq(categories.id, id));
  }

  const updated = await db.select().from(categories).where(eq(categories.id, id));
  return c.json(ok(updated[0], 'Kategori berhasil diubah'));
});

/** DELETE /api/categories/:id — Hapus kategori, item pindah ke "Lainnya" (ON DELETE SET NULL) */
categoriesRoute.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const db = createDb(c.env.DB);

  const existing = await db.select().from(categories).where(eq(categories.id, id));
  if (existing.length === 0) {
    return c.json(err('Kategori tidak ditemukan'), 404);
  }

  // Update items dulu karena ON DELETE SET NULL mungkin tidak selalu bekerja di D1
  await db.update(items).set({ categoryId: null }).where(eq(items.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));

  return c.json(ok(null, 'Kategori berhasil dihapus'));
});

export default categoriesRoute;
