// server/lib/validation.ts — Skema Zod untuk validasi input
// Sesuai PRD bagian 10.2
import { z } from 'zod';

/** Validasi login */
export const loginSchema = z.object({
  code: z.string().min(1, 'Kode akses wajib diisi'),
});

/** Validasi kategori */
export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Nama kategori wajib diisi').max(40, 'Nama kategori maksimal 40 karakter'),
});

/** Validasi update kategori (bisa mengubah nama atau urutan) */
export const categoryUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Nama kategori wajib diisi').max(40, 'Nama kategori maksimal 40 karakter').optional(),
  sortOrder: z.number().int().optional(),
});

/** Validasi item dasar */
const itemBase = {
  title: z.string().trim().min(1, 'Judul wajib diisi').max(100, 'Judul maksimal 100 karakter'),
  categoryId: z.string().nullable().optional(),
  isPinned: z.union([z.boolean(), z.number()]).optional(),
  sortOrder: z.number().int().optional(),
};

/** Validasi item tipe link */
export const linkItemSchema = z.object({
  ...itemBase,
  type: z.literal('link'),
  url: z.string().url('URL tidak valid').max(2000, 'URL maksimal 2000 karakter')
    .refine((u) => u.startsWith('http://') || u.startsWith('https://'), 'URL harus diawali http:// atau https://'),
  description: z.string().max(300, 'Deskripsi maksimal 300 karakter').nullable().optional(),
});

/** Validasi item tipe catatan */
export const noteItemSchema = z.object({
  ...itemBase,
  type: z.literal('note'),
  content: z.string().min(1, 'Isi catatan wajib diisi').max(5000, 'Isi catatan maksimal 5000 karakter'),
});

/** Validasi item tipe rahasia */
export const secretItemSchema = z.object({
  ...itemBase,
  type: z.literal('secret'),
  username: z.string().max(200, 'Username maksimal 200 karakter').optional().default(''),
  password: z.string().min(1, 'Password wajib diisi').max(500, 'Password maksimal 500 karakter'),
});

/** Validasi item gabungan (discriminated union berdasarkan tipe) */
export const createItemSchema = z.discriminatedUnion('type', [
  linkItemSchema,
  noteItemSchema,
  secretItemSchema,
]);

/** Validasi update item — lebih longgar karena bisa partial */
export const updateItemSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  categoryId: z.string().nullable().optional(),
  isPinned: z.union([z.boolean(), z.number()]).optional(),
  sortOrder: z.number().int().optional(),
  // Link fields
  url: z.string().url().max(2000).refine((u) => u.startsWith('http://') || u.startsWith('https://'), 'URL harus diawali http:// atau https://').optional(),
  description: z.string().max(300).nullable().optional(),
  // Note fields
  content: z.string().min(1).max(5000).optional(),
  // Secret fields
  username: z.string().max(200).optional(),
  password: z.string().max(500).optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
