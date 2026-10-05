// src/lib/api.ts — Wrapper fetch ke /api dengan fallback dev offline storage
// Jika backend Cloudflare /api belum berjalan, otomatis fallback ke local storage mock

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: number;
}

export interface ItemBase {
  id: string;
  categoryId: string | null;
  type: 'link' | 'note' | 'secret';
  title: string;
  description: string | null;
  url: string | null;
  content: string | null;
  isPinned: number;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface SecretData {
  username: string;
  password: string;
}

// ===== Default Mock Data for Seamless Preview & Offline Dev =====
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Administrasi & Desa Adat', sortOrder: 1, createdAt: Date.now() - 300000 },
  { id: 'cat-2', name: 'Program Kerja Banjar', sortOrder: 2, createdAt: Date.now() - 200000 },
  { id: 'cat-3', name: 'Dokumentasi & Media Budaya', sortOrder: 3, createdAt: Date.now() - 100000 },
];

const DEFAULT_ITEMS: (ItemBase & { secretPassword?: string; username?: string })[] = [
  {
    id: 'item-1',
    categoryId: 'cat-1',
    type: 'link',
    title: 'Folder Google Drive LPJ & Proposal Desa Adat',
    url: 'https://drive.google.com/drive/folders/kkn-bali-rahayu-2026',
    description: 'Pusat berkas proposal, format lembar pengesahan Jero Bendesa, presensi harian posko, dan arsip LPJ desa adat.',
    content: null,
    isPinned: 1,
    sortOrder: 1,
    createdAt: Date.now() - 500000,
    updatedAt: Date.now() - 500000,
  },
  {
    id: 'item-2',
    categoryId: 'cat-1',
    type: 'link',
    title: 'Spreadsheet Kas Posko & Punia Upakara',
    url: 'https://docs.google.com/spreadsheets/d/kkn-anggaran-bali-2026',
    description: 'Rincian kas kelompok, kwitansi konsumsi & logistik posko, serta rekapitulasi dana punia kegiatan banjar.',
    content: null,
    isPinned: 1,
    sortOrder: 2,
    createdAt: Date.now() - 400000,
    updatedAt: Date.now() - 400000,
  },
  {
    id: 'item-3',
    categoryId: 'cat-2',
    type: 'note',
    title: 'Rundown Sosialisasi Bank Sampah di Bale Banjar',
    url: null,
    description: null,
    content: `08.00 - 08.30 : Penyambutan Krama Banjar & Sekaa Teruna Teruni (STT)
08.30 - 08.45 : Doa Bersama & Sambutan Jero Bendesa Adat
08.45 - 09.30 : Edukasi Pemilahan Sampah Berbasis Sumber (Pergub Bali No. 47)
09.30 - 10.15 : Praktik Pembuatan Eco-Enzyme & Kompos Organik
10.15 - 10.45 : Diskusi & Penyerahan Tong Sampah Pilah Simbolis
10.45 - selesai: Ramah Tamah & Foto Bersama Prajuru Banjar`,
    isPinned: 0,
    sortOrder: 3,
    createdAt: Date.now() - 300000,
    updatedAt: Date.now() - 300000,
  },
  {
    id: 'item-4',
    categoryId: 'cat-2',
    type: 'note',
    title: 'Daftar Kontak Prajuru Desa Adat & Posko KKN',
    url: null,
    description: null,
    content: `Jero Bendesa Adat: I Wayan Sudarma (0812-3456-7890)
Kelian Dinas / Perbekel: I Made Wirata (0813-9876-5432)
Prajuru Pecalang: I Nyoman Sukarba (0856-1122-3344)
Ketua Sekaa Teruna (STT): I Ketut Agus (0878-5566-7788)
Koordinator Posko KKN: Alexander (0821-4455-6677)`,
    isPinned: 0,
    sortOrder: 4,
    createdAt: Date.now() - 250000,
    updatedAt: Date.now() - 250000,
  },
  {
    id: 'item-5',
    categoryId: 'cat-3',
    type: 'secret',
    title: 'Akun Instagram Resmi @kkn.balirahayu2026',
    url: null,
    description: null,
    content: null,
    isPinned: 1,
    sortOrder: 5,
    createdAt: Date.now() - 200000,
    updatedAt: Date.now() - 200000,
    username: '@kkn.balirahayu2026',
    secretPassword: 'RahayuBali2026!',
  },
  {
    id: 'item-6',
    categoryId: 'cat-3',
    type: 'secret',
    title: 'WiFi Posko KKN & Google Workspace Budaya',
    url: null,
    description: null,
    content: null,
    isPinned: 0,
    sortOrder: 6,
    createdAt: Date.now() - 150000,
    updatedAt: Date.now() - 150000,
    username: 'kkn.balirahayu@gmail.com',
    secretPassword: 'AstungkaraSukses2026#',
  },
];

// Helper storage mock dengan namespace Bali
function getMockStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(`kkn_bali_v1_${key}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultVal;
}

function setMockStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`kkn_bali_v1_${key}`, JSON.stringify(val));
  } catch {}
}

/** Base fetch wrapper dengan otomatis fallback jika server offline */
async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (res.ok) {
      return (await res.json()) as ApiResponse<T>;
    }

    // Jika response status 401/403/400 terdefinisi dari backend nyata
    if (res.status === 401 || res.status === 400 || res.status === 403) {
      const json = await res.json() as ApiResponse<T>;
      throw new ApiError(json.message || 'Terjadi kesalahan', res.status);
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Jika koneksi gagal (504, 502, network offline, atau dev backend proxy belum jalan)
  }

  // Fallback Dev Mock Mode
  return handleMockRequest<T>(url, options);
}

// Handler request mock lokal
function handleMockRequest<T>(url: string, options?: RequestInit): ApiResponse<T> {
  const method = (options?.method || 'GET').toUpperCase();
  const body = options?.body ? JSON.parse(options.body as string) : {};

  // Auth: /api/auth/me
  if (url === '/api/auth/me') {
    const isAuth = localStorage.getItem('kkn_hub_auth') === 'true';
    if (!isAuth) {
      throw new ApiError('Sesi tidak valid', 401);
    }
    return { success: true, data: { authenticated: true } as T, message: 'OK' };
  }

  // Auth: /api/auth/login
  if (url === '/api/auth/login') {
    localStorage.setItem('kkn_hub_auth', 'true');
    return { success: true, data: { authenticated: true } as T, message: 'Berhasil masuk' };
  }

  // Auth: /api/auth/logout
  if (url === '/api/auth/logout') {
    localStorage.removeItem('kkn_hub_auth');
    return { success: true, data: {} as T, message: 'Berhasil keluar' };
  }

  // Categories: list
  if (url === '/api/categories' && method === 'GET') {
    const cats = getMockStorage<Category[]>('categories', DEFAULT_CATEGORIES);
    return { success: true, data: cats as T, message: 'OK' };
  }

  // Categories: create
  if (url === '/api/categories' && method === 'POST') {
    const cats = getMockStorage<Category[]>('categories', DEFAULT_CATEGORIES);
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: body.name,
      sortOrder: cats.length + 1,
      createdAt: Date.now(),
    };
    cats.push(newCat);
    setMockStorage('categories', cats);
    return { success: true, data: newCat as T, message: 'Kategori dibuat' };
  }

  // Categories: update / delete
  if (url.startsWith('/api/categories/')) {
    const id = url.split('/api/categories/')[1];
    let cats = getMockStorage<Category[]>('categories', DEFAULT_CATEGORIES);

    if (method === 'PATCH') {
      cats = cats.map((c) => (c.id === id ? { ...c, ...body } : c));
      setMockStorage('categories', cats);
      const updated = cats.find((c) => c.id === id);
      return { success: true, data: updated as T, message: 'Kategori diperbarui' };
    }

    if (method === 'DELETE') {
      cats = cats.filter((c) => c.id !== id);
      setMockStorage('categories', cats);
      // Unlink items
      let items = getMockStorage<ItemBase[]>('items', DEFAULT_ITEMS);
      items = items.map((i) => (i.categoryId === id ? { ...i, categoryId: null } : i));
      setMockStorage('items', items);
      return { success: true, data: {} as T, message: 'Kategori dihapus' };
    }
  }

  // Items: list
  if (url === '/api/items' && method === 'GET') {
    const items = getMockStorage<ItemBase[]>('items', DEFAULT_ITEMS);
    return { success: true, data: items as T, message: 'OK' };
  }

  // Items: create
  if (url === '/api/items' && method === 'POST') {
    const items = getMockStorage<any[]>('items', DEFAULT_ITEMS);
    const newItem: any = {
      id: `item-${Date.now()}`,
      categoryId: body.categoryId || null,
      type: body.type,
      title: body.title,
      description: body.description || null,
      url: body.url || null,
      content: body.content || null,
      isPinned: 0,
      sortOrder: items.length + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      secretPassword: body.password || '',
      username: body.username || '',
    };
    items.unshift(newItem);
    setMockStorage('items', items);
    return { success: true, data: newItem as T, message: 'Item dibuat' };
  }

  // Items: reveal secret
  if (url.endsWith('/reveal') && method === 'GET') {
    const id = url.split('/api/items/')[1].replace('/reveal', '');
    const items = getMockStorage<any[]>('items', DEFAULT_ITEMS);
    const item = items.find((i) => i.id === id);
    return {
      success: true,
      data: {
        username: item?.username || (id === 'item-5' ? '@kkn.balirahayu2026' : 'kkn.balirahayu@gmail.com'),
        password: item?.secretPassword || 'RahayuBali2026!',
      } as T,
      message: 'OK',
    };
  }

  // Items: update / delete
  if (url.startsWith('/api/items/')) {
    const id = url.split('/api/items/')[1];
    let items = getMockStorage<any[]>('items', DEFAULT_ITEMS);

    if (method === 'PATCH') {
      items = items.map((i) => (i.id === id ? { ...i, ...body, updatedAt: Date.now() } : i));
      setMockStorage('items', items);
      const updated = items.find((i) => i.id === id);
      return { success: true, data: updated as T, message: 'Item diperbarui' };
    }

    if (method === 'DELETE') {
      items = items.filter((i) => i.id !== id);
      setMockStorage('items', items);
      return { success: true, data: {} as T, message: 'Item dihapus' };
    }
  }

  return { success: true, data: {} as T, message: 'OK' };
}

// ===== Auth =====
export const authApi = {
  login: (code: string) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ code }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
};

// ===== Categories =====
export const categoriesApi = {
  list: () => request<Category[]>('/api/categories'),
  create: (name: string) => request<Category>('/api/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  update: (id: string, data: Partial<{ name: string; sortOrder: number }>) =>
    request<Category>(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/api/categories/${id}`, { method: 'DELETE' }),
};

// ===== Items =====
export const itemsApi = {
  list: () => request<ItemBase[]>('/api/items'),
  create: (data: Record<string, unknown>) => request<ItemBase>('/api/items', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<ItemBase>(`/api/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/api/items/${id}`, { method: 'DELETE' }),
  reveal: (id: string) => request<SecretData>(`/api/items/${id}/reveal`),
};
