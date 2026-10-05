# PRD: KKN Hub (Pusat Link dan Catatan Kelompok KKN)

Versi: 1.0 | Tanggal: 4 Oktober 2026 | Status: Draft siap eksekusi AI coding agent

**Ringkasan 3 baris**
1. KKN Hub adalah satu halaman web bergaya lynk.id yang menjadi pintu ke semua link kelompok KKN (Drive, Canva, dll), catatan teks, dan item rahasia (akun bersama).
2. Tanpa akun per anggota. Seluruh web dijaga satu kode akses bersama, semua yang punya kode boleh tambah, ubah, hapus.
3. Stack 100% gratis: Vite + React di Cloudflare Pages, API Hono di Pages Functions, database Cloudflare D1.

---

## 1. RINGKASAN EKSEKUTIF

### 1.1 Deskripsi Project
KKN Hub adalah web internal untuk satu kelompok KKN. Isinya kumpulan kartu yang dikelompokkan per kategori (Dokumentasi, Desain, Laporan, Akun, dan seterusnya). Ada tiga tipe kartu: **Link** (tombol yang membuka URL), **Catatan** (teks bebas yang selalu terlihat, bisa dipakai sebagai pengingat), dan **Rahasia** (judul, username, password yang disembunyikan secara default). Tampilannya meniru lynk.id: satu kolom di tengah layar, kartu besar yang gampang disentuh, mobile-first dan tetap rapi di laptop.

### 1.2 Masalah yang Diselesaikan
Link penting yang dibagikan di grup chat (Drive, Canva, form, dokumen laporan) cepat tenggelam oleh chat lain. Anggota harus scroll atau bertanya ulang "linknya mana?". Informasi bersama seperti akun grup juga tercecer dan kadang hilang.

### 1.3 Solusi yang Ditawarkan
Satu URL tetap yang bisa di-pin di grup. Semua link dan catatan tersimpan rapi, bisa dicari, dan bisa diedit siapa saja dari HP. Item rahasia tidak ikut terlihat di daftar dan hanya tampil setelah tombol "Tampilkan" ditekan.

### 1.4 Target Pengguna
Anggota satu kelompok KKN (perkiraan 5 sampai 30 orang), mayoritas membuka dari HP, sebagian dari laptop.

### 1.5 Asumsi dan Batasan
Asumsi yang dibuat (jika salah, beri tahu agar PRD diperbarui):

| No | Asumsi |
|----|--------|
| A1 | Hanya ada satu kelompok, satu workspace. Tidak ada multi-tenant. |
| A2 | Tidak ada akun per anggota. Akses dijaga satu kode akses bersama yang disimpan sebagai secret di Cloudflare. |
| A3 | Semua pemegang kode punya hak penuh (lihat, tambah, ubah, hapus, lihat item rahasia). |
| A4 | Tidak ada notifikasi (email/Telegram). "Reminder" berarti catatan yang selalu terlihat dan bisa di-pin ke atas. |
| A5 | Jumlah data kecil (di bawah 500 item), jadi semua item dimuat sekali lalu difilter di sisi klien. |
| A6 | Bahasa antarmuka Indonesia. |
| A7 | Nama aplikasi "KKN Hub" masih placeholder. [PERLU KONFIRMASI: nama dan nama desa/kelompok untuk judul halaman] |
| A8 | Item rahasia hanya untuk akun bersama kelompok (mis. akun Canva grup), bukan akun pribadi atau akun penting (bank, email utama). |

Batasan: wajib gratis, tidak ada fitur di luar bagian 5, dan tidak ada riwayat perubahan karena tidak ada identitas per pengguna.

---

## 2. TUJUAN DAN METRIK KEBERHASILAN

| Tujuan | Metrik | Target |
|--------|--------|--------|
| Link tidak tenggelam lagi | Jumlah permintaan "linknya mana?" di grup | Turun mendekati 0 dalam 2 minggu |
| Mudah diisi anggota | Waktu menambah satu link dari HP | Kurang dari 20 detik |
| Mudah dicari | Waktu menemukan item lewat pencarian | Kurang dari 5 detik |
| Aman secukupnya | Item rahasia terlihat di daftar tanpa aksi pengguna | 0 kasus |
| Biaya | Biaya bulanan hosting dan database | Rp 0 |

---

## 3. USER ROLES DAN PERMISSION

| Role | Deskripsi | Akses Utama |
|------|-----------|-------------|
| Anggota | Siapa pun yang memegang kode akses | Semua fitur: lihat, tambah, ubah, hapus item dan kategori, pin, cari, tampilkan item rahasia |
| Pemilik teknis | Orang yang mengelola Cloudflare (kamu) | Mengatur ACCESS_CODE, SESSION_SECRET, SECRET_ENC_KEY di dashboard Cloudflare. Bukan role di dalam aplikasi. |

---

## 4. USER STORIES

Format: Sebagai [role], saya ingin [aksi], agar [manfaat].

### Modul: Akses
- [ ] US-001: Sebagai anggota, saya ingin masuk dengan satu kode akses, agar tidak perlu membuat akun.
  - Acceptance Criteria:
    - [ ] Kode benar: diarahkan ke halaman utama dan perangkat diingat 30 hari.
    - [ ] Kode salah: muncul pesan "Kode akses salah" tanpa membocorkan kode.
    - [ ] Setelah 5 kali salah dari IP yang sama dalam 15 menit, login diblokir sementara.
    - [ ] Semua halaman dan API selain login menolak akses tanpa sesi.
- [ ] US-002: Sebagai anggota, saya ingin keluar dari perangkat tertentu, agar bisa mencabut akses di HP yang bukan milik saya.

### Modul: Kategori
- [ ] US-010: Sebagai anggota, saya ingin menambah, mengganti nama, dan menghapus kategori, agar item tertata.
  - Acceptance Criteria:
    - [ ] Nama kategori unik, 1 sampai 40 karakter.
    - [ ] Menghapus kategori tidak menghapus item. Item pindah ke "Lainnya".
    - [ ] Muncul dialog konfirmasi sebelum menghapus.

### Modul: Item Link
- [ ] US-020: Sebagai anggota, saya ingin menyimpan link dengan judul dan deskripsi singkat, agar mudah dikenali.
  - Acceptance Criteria:
    - [ ] URL wajib diawali http:// atau https://.
    - [ ] Menekan kartu membuka link di tab baru.
    - [ ] Ada tombol salin link.
- [ ] US-021: Sebagai anggota, saya ingin mengubah dan menghapus link, agar daftar tetap benar.
  - Acceptance Criteria:
    - [ ] Hapus selalu meminta konfirmasi.

### Modul: Item Catatan
- [ ] US-030: Sebagai anggota, saya ingin menulis catatan teks (pengingat, jadwal, info penting), agar semua orang membacanya tanpa membuka chat.
  - Acceptance Criteria:
    - [ ] Isi catatan tampil langsung di kartu (maksimal 3 baris, bisa dibuka penuh).
    - [ ] Teks mempertahankan baris baru.
    - [ ] Ada tombol salin isi.

### Modul: Item Rahasia
- [ ] US-040: Sebagai anggota, saya ingin menyimpan akun bersama (judul, username, password), agar tidak tercecer di chat.
  - Acceptance Criteria:
    - [ ] Di daftar, username dan password tidak pernah ikut terkirim ke klien.
    - [ ] Menekan "Tampilkan" memanggil server dan menampilkan isi, otomatis tersembunyi lagi setelah 30 detik.
    - [ ] Ada tombol salin username dan salin password.
    - [ ] Di database, isi rahasia tersimpan terenkripsi.

### Modul: Pencarian dan Pin
- [ ] US-050: Sebagai anggota, saya ingin mencari item dan memfilter per kategori, agar cepat menemukan yang dicari.
  - Acceptance Criteria:
    - [ ] Pencarian mencocokkan judul, deskripsi, URL, dan isi catatan. Untuk item rahasia hanya judul.
    - [ ] Hasil muncul saat mengetik, tanpa tombol cari.
- [ ] US-051: Sebagai anggota, saya ingin mem-pin item penting, agar selalu muncul di paling atas.

---

## 5. FITUR DAN SCOPE

### 5.1 Fitur Wajib (MVP)
| ID | Fitur | Deskripsi | Kompleksitas |
|----|-------|-----------|--------------|
| F-001 | Gerbang kode akses | Login satu kode, cookie bertanda tangan 30 hari, pembatasan percobaan | Sedang |
| F-002 | CRUD kategori | Tambah, ubah nama, hapus, urutan sederhana | Rendah |
| F-003 | CRUD item Link | Judul, URL, deskripsi, kategori | Rendah |
| F-004 | CRUD item Catatan | Judul, isi teks, kategori | Rendah |
| F-005 | CRUD item Rahasia | Judul, username, password terenkripsi, tombol tampilkan dan salin | Sedang |
| F-006 | Pin item | Item ter-pin tampil di bagian "Disematkan" paling atas | Rendah |
| F-007 | Pencarian dan filter kategori | Filter di sisi klien | Rendah |
| F-008 | Tampilan ala lynk.id | Satu kolom, kartu besar, responsif HP dan laptop | Sedang |
| F-009 | Konfirmasi hapus | Dialog sebelum hapus item atau kategori | Rendah |

### 5.2 Fitur Diinginkan (Should Have)
| ID | Fitur | Deskripsi | Kompleksitas |
|----|-------|-----------|--------------|
| F-101 | Sampah 30 hari | Hapus jadi soft delete, bisa dipulihkan. Mengurangi risiko salah hapus karena semua orang boleh hapus. | Sedang |
| F-102 | Favicon link | Ikon situs di kartu link (layanan favicon publik) | Rendah |

### 5.3 Fitur Opsional (Nice to Have)
| ID | Fitur | Deskripsi | Kompleksitas |
|----|-------|-----------|--------------|
| F-201 | Mode gelap | Mengikuti pengaturan sistem | Rendah |
| F-202 | Drag and drop urutan | Mengatur urutan kartu manual | Sedang |

### 5.4 Di Luar Scope
- Akun per anggota, peran admin dan anggota biasa.
- Riwayat perubahan atau penanda "siapa yang mengedit" (tidak ada identitas per pengguna).
- Notifikasi email, Telegram, atau push untuk deadline.
- Upload file (gunakan link Drive).
- Halaman publik tanpa kode akses.
- Multi-kelompok.

---

## 6. ARSITEKTUR SISTEM

### 6.1 Gambaran Umum
Arsitektur SPA + API dalam satu project Cloudflare Pages. Frontend statis (Vite + React) dilayani dari CDN Cloudflare. Backend berupa Pages Functions (Hono) di path `/api/*`. Data disimpan di D1 (SQLite terkelola). Tidak ada server yang perlu dijaga, tidak ada cold sleep, dan semua dalam satu platform.

```
HP / Laptop  ->  Cloudflare Pages (SPA statis)
                      |
                      v  fetch /api/*
              Pages Functions (Hono)
                 |  cek cookie sesi (kecuali /api/auth/*)
                 v
              D1 (SQLite) via Drizzle ORM
                 ^
                 |  enkripsi AES-GCM (Web Crypto) untuk item rahasia
```

### 6.2 Perbandingan Opsi Stack
Syarat utama: gratis. Penilaian dari 10 berdasarkan biaya, kemudahan setup, ketahanan (tidak tidur atau terblokir), dan kecocokan untuk dieksekusi AI agent.

| Opsi | Stack | Nilai | Kelebihan | Kekurangan |
|------|-------|-------|-----------|------------|
| A | Vite + React di Cloudflare Pages, API Hono (Pages Functions), D1 + Drizzle | 9/10 | Satu platform, gratis tanpa kartu, tanpa cold sleep, database tidak di-pause, deploy sederhana, D1 + Drizzle sudah familiar | Runtime Workers bukan Node penuh (enkripsi pakai Web Crypto), limit 100 ribu request per hari |
| B | Next.js di Vercel + Supabase (Postgres) | 7/10 | Ekosistem besar, banyak contoh, Postgres | Dua platform, project Supabase gratis bisa di-pause kalau lama tidak aktif, Next.js lebih berat dari kebutuhan |
| C | Next.js di Cloudflare Pages + D1 | 6/10 | Satu platform, fitur Next lengkap | Kompatibilitas versi Next.js dengan build Cloudflare sering bermasalah, debugging memakan waktu |
| D | Firebase Hosting + Firestore + Functions | 6/10 | Setup cepat, realtime | Cloud Functions butuh paket berbayar (wajib kartu), aturan keamanan Firestore rumit untuk model "satu kode bersama", vendor lock-in |

**Rekomendasi akhir: Opsi A.** Untuk aplikasi sekecil ini, satu platform tanpa tidur dan tanpa kartu adalah nilai terbesarnya. Opsi C sengaja dihindari karena risiko masalah build jauh lebih besar dari manfaat Next.js.

Angka limit gratis yang relevan (per saat dokumen ini ditulis): D1 gratis 5 juta baris dibaca dan 100 ribu baris ditulis per hari, Workers gratis 100 ribu request per hari. Untuk satu kelompok KKN itu jauh di atas kebutuhan. Agent perlu mengecek ulang angka terbaru di dokumentasi Cloudflare saat setup.

### 6.3 Technology Stack Final

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS | Ringan, build cepat, tanpa SSR |
| State dan data | TanStack Query | Cache dan refetch sederhana |
| Backend | Hono di Cloudflare Pages Functions | Ringan, TypeScript, cocok dengan Workers |
| Validasi | Zod | Satu skema dipakai untuk validasi input |
| Database | Cloudflare D1 + Drizzle ORM | Gratis, tanpa server, migrasi terkelola |
| Auth | Kode akses bersama + cookie bertanda tangan (`hono/cookie`) | Tanpa akun, tetap ada gerbang |
| Enkripsi | AES-GCM 256 bit via Web Crypto | Tersedia bawaan di Workers |
| Hosting | Cloudflare Pages | Gratis, CDN global |
| Storage file | Tidak ada | Di luar scope |

### 6.4 Integrasi Eksternal
Tidak ada integrasi wajib. Opsional (F-102): layanan favicon publik untuk ikon link.

---

## 7. DESAIN DATABASE

### 7.1 Entity Relationship (Deskriptif)
Ada tiga tabel. Satu **kategori** punya banyak **item** (relasi satu ke banyak). Kolom `category_id` pada item boleh kosong. Jika kategori dihapus, `category_id` item otomatis menjadi NULL dan item tampil di grup "Lainnya". Tabel **login_attempts** berdiri sendiri, hanya untuk membatasi percobaan login.

### 7.2 Skema Tabel

#### Tabel: categories
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | TEXT | PK, NOT NULL | UUID dari `crypto.randomUUID()` |
| name | TEXT | NOT NULL, UNIQUE | 1 sampai 40 karakter |
| sort_order | INTEGER | NOT NULL, default 0 | Urutan tampil |
| created_at | INTEGER | NOT NULL, default `unixepoch()` | Detik sejak epoch |

#### Tabel: items
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | TEXT | PK, NOT NULL | UUID |
| category_id | TEXT | FK ke categories.id, ON DELETE SET NULL | Boleh NULL |
| type | TEXT | NOT NULL, CHECK in ('link','note','secret') | Tipe kartu |
| title | TEXT | NOT NULL | 1 sampai 100 karakter |
| description | TEXT | NULL | Maksimal 300 karakter, untuk tipe link |
| url | TEXT | NULL | Wajib untuk tipe link, maksimal 2000 karakter |
| content | TEXT | NULL | Wajib untuk tipe note, maksimal 5000 karakter |
| secret_payload | TEXT | NULL | Wajib untuk tipe secret: base64(iv + ciphertext) dari JSON `{username, password}` |
| is_pinned | INTEGER | NOT NULL, default 0 | 0 atau 1 |
| sort_order | INTEGER | NOT NULL, default 0 | Urutan dalam kategori |
| created_at | INTEGER | NOT NULL, default `unixepoch()` | |
| updated_at | INTEGER | NOT NULL, default `unixepoch()` | Diperbarui setiap edit |

Indeks: `items(category_id)` dan `items(is_pinned)`.

#### Tabel: login_attempts
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | INTEGER | PK, AUTOINCREMENT | |
| ip | TEXT | NOT NULL | Dari header `CF-Connecting-IP` |
| attempted_at | INTEGER | NOT NULL | Detik sejak epoch |

Indeks: `login_attempts(ip, attempted_at)`.

### 7.3 Skema Drizzle (acuan untuk agent)
```ts
// server/db/schema.ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Kategori item
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});

// Item bertipe link, note, atau secret
export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  type: text('type', { enum: ['link', 'note', 'secret'] }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  url: text('url'),
  content: text('content'),
  secretPayload: text('secret_payload'), // base64(iv + ciphertext), jangan pernah dikirim di endpoint list
  isPinned: integer('is_pinned').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (t) => ({
  byCategory: index('items_category_idx').on(t.categoryId),
  byPinned: index('items_pinned_idx').on(t.isPinned),
}));

// Pembatasan percobaan login
export const loginAttempts = sqliteTable('login_attempts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ip: text('ip').notNull(),
  attemptedAt: integer('attempted_at').notNull(),
}, (t) => ({
  byIp: index('login_attempts_ip_idx').on(t.ip, t.attemptedAt),
}));
```

### 7.4 Kontrak API
Semua endpoint di bawah `/api`. Semua response memakai format `{ success: boolean, data: any, message: string }`. Semua endpoint selain `/api/auth/login` membutuhkan cookie sesi yang valid, jika tidak response 401.

| Method | Path | Fungsi |
|--------|------|--------|
| POST | /api/auth/login | Body `{ code }`. Set cookie sesi bila benar |
| POST | /api/auth/logout | Hapus cookie sesi |
| GET | /api/auth/me | Cek sesi valid (untuk guard di frontend) |
| GET | /api/categories | Daftar kategori terurut |
| POST | /api/categories | Tambah kategori `{ name }` |
| PATCH | /api/categories/:id | Ubah nama atau urutan |
| DELETE | /api/categories/:id | Hapus kategori, item menjadi tanpa kategori |
| GET | /api/items | Semua item. Untuk tipe secret, `secret_payload` tidak disertakan |
| POST | /api/items | Tambah item sesuai tipe |
| PATCH | /api/items/:id | Ubah item (termasuk `is_pinned`, `category_id`) |
| DELETE | /api/items/:id | Hapus item |
| GET | /api/items/:id/reveal | Dekripsi dan kembalikan `{ username, password }` untuk item secret |

---

## 8. ALUR SISTEM (USER FLOW)

### Flow: Masuk
```
Buka URL -> GET /api/auth/me
   |-- 200 -> halaman utama
   |-- 401 -> halaman /login -> isi kode -> POST /api/auth/login
         |-- benar -> set cookie 30 hari -> halaman utama
         |-- salah -> pesan "Kode akses salah" (dihitung ke login_attempts)
         |-- 5 kali salah dalam 15 menit -> 429 "Terlalu banyak percobaan, coba lagi nanti"
```

### Flow: Tambah Link
```
Tombol "+" -> pilih tipe "Link" -> isi judul, URL, deskripsi, kategori
  -> validasi di klien (Zod) -> POST /api/items -> validasi di server
  -> sukses: tutup form, daftar ter-refresh, toast "Tersimpan"
  -> gagal: tampil pesan error per kolom
```

### Flow: Lihat Item Rahasia
```
Kartu rahasia (isi tersembunyi) -> tekan "Tampilkan"
  -> GET /api/items/:id/reveal -> server dekripsi -> klien tampilkan username dan password
  -> 30 detik kemudian otomatis tersembunyi lagi
  -> tombol "Salin" menyalin ke clipboard
```

### Flow: Hapus Item
```
Menu kartu -> "Hapus" -> dialog konfirmasi -> DELETE /api/items/:id
  -> sukses: kartu hilang, toast "Terhapus"
```

---

## 9. DESAIN UI/UX

### 9.1 Halaman
| ID | Halaman | Route | Akses |
|----|---------|-------|-------|
| P-001 | Login kode akses | /login | Publik |
| P-002 | Beranda (daftar item) | / | Sesi valid |
| P-003 | Kelola kategori | /kategori | Sesi valid |

Form tambah dan ubah item berupa modal atau bottom sheet di atas P-002, bukan halaman terpisah.

### 9.2 Layout Beranda (gaya lynk.id)
Satu kolom di tengah layar. Lebar penuh di HP (dengan padding 16 px), dan `max-width` sekitar 560 px di laptop, dipusatkan, dengan latar halaman netral. Dari atas ke bawah:

1. Header: nama kelompok atau KKN, subjudul singkat, tombol keluar kecil.
2. Kolom pencarian.
3. Chip kategori yang bisa digeser horizontal, dengan chip "Semua" di awal.
4. Bagian "Disematkan" (hanya muncul bila ada item ter-pin).
5. Daftar item dikelompokkan per kategori, dengan judul kategori sebagai pemisah.
6. Tombol "+" mengambang di kanan bawah.

### 9.3 Komponen UI
- `LinkCard`: tombol lebar penuh, sudut membulat besar, judul tebal, domain dan deskripsi kecil di bawah, ikon salin dan menu titik tiga di kanan. Menekan badan kartu membuka link di tab baru.
- `NoteCard`: kartu dengan judul dan isi (3 baris, "Lihat selengkapnya"), tombol salin.
- `SecretCard`: judul, teks "Disembunyikan", tombol "Tampilkan". Saat terbuka: username dan password dengan tombol salin masing-masing.
- `ItemFormSheet`: form dengan pilihan tipe (Link, Catatan, Rahasia) di atas, kolom menyesuaikan tipe.
- `ConfirmDialog`, `Toast`, `EmptyState`, `CategoryChips`, `SearchInput`.

### 9.4 Prinsip Desain
- Mobile-first. Area sentuh minimal 44 px. Diuji di lebar 360 px dan 1280 px.
- Kontras teks memenuhi WCAG AA. Label tombol berupa teks, bukan ikon saja.
- Semua teks antarmuka berbahasa Indonesia.
- Palet netral dengan satu warna aksen. [PERLU KONFIRMASI: warna aksen atau logo KKN, jika tidak diisi pakai biru]
- Keadaan kosong dan memuat harus ada (skeleton atau teks "Memuat...").

---

## 10. KEAMANAN DAN VALIDASI

### 10.1 Autentikasi dan Otorisasi
- Kode akses disimpan sebagai secret `ACCESS_CODE`, tidak pernah ada di kode atau repository.
- Perbandingan kode memakai pembandingan waktu konstan (hash kedua sisi dengan SHA-256, lalu bandingkan).
- Setelah benar, server membuat cookie bertanda tangan lewat `setSignedCookie` dengan `SESSION_SECRET`. Atribut: HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age 30 hari.
- Middleware memeriksa cookie di semua `/api/*` kecuali `/api/auth/login`.
- Untuk mencabut semua sesi sekaligus: ganti `SESSION_SECRET`. Mengganti `ACCESS_CODE` saja tidak mengeluarkan perangkat yang sudah masuk.
- Pembatasan: maksimal 5 percobaan gagal per IP per 15 menit (tabel `login_attempts`). Baris lama (lebih dari 1 hari) dibersihkan saat login.

### 10.2 Validasi Input (Zod, di server dan klien)
| Entitas | Aturan |
|---------|--------|
| Kategori | `name` trim, 1 sampai 40 karakter, unik (tanpa membedakan huruf besar kecil) |
| Item umum | `title` trim 1 sampai 100, `type` salah satu dari link, note, secret, `category_id` harus ada atau null |
| Link | `url` wajib, hanya skema `http` atau `https`, maksimal 2000 karakter, `description` maksimal 300 |
| Catatan | `content` wajib, maksimal 5000 karakter |
| Rahasia | `username` maksimal 200, `password` wajib maksimal 500 |

Semua query lewat Drizzle (parameterized). Teks pengguna dirender sebagai teks biasa oleh React, tidak ada `dangerouslySetInnerHTML`. Link dibuka dengan `rel="noopener noreferrer"`.

### 10.3 Keamanan Data
- Item rahasia dienkripsi AES-GCM 256 bit. Kunci dari secret `SECRET_ENC_KEY` (32 byte, base64). Setiap enkripsi memakai IV acak 12 byte yang disimpan di depan ciphertext.
- Endpoint `GET /api/items` tidak pernah mengirim `secret_payload`. Isi hanya keluar lewat `/api/items/:id/reveal`.
- Semua response API memakai header `Cache-Control: no-store`. Halaman diberi `<meta name="robots" content="noindex">` dan header `X-Robots-Tag: noindex` agar tidak masuk mesin pencari.
- Cara membuat nilai secret: `openssl rand -base64 32` untuk `SESSION_SECRET` dan `SECRET_ENC_KEY`, dan kode akses dipilih sendiri (disarankan minimal 10 karakter).
- Keterbatasan yang harus dipahami tim: enkripsi melindungi dari kebocoran database dan dari orang yang hanya melihat dashboard D1. Enkripsi tidak melindungi dari siapa pun yang memegang kode akses, karena semua pemegang kode boleh membuka item rahasia. Jadi simpan hanya akun bersama kelompok dan jangan simpan akun pribadi atau akun penting (bank, email utama).

---

## 11. PERFORMA DAN SKALABILITAS

| Aspek | Requirement |
|-------|-------------|
| Waktu muat halaman utama | Di bawah 2 detik di jaringan 4G |
| Pengguna bersamaan | Sampai 30 |
| Jumlah item | Nyaman sampai 500 item (dimuat sekali, difilter di klien) |
| Ukuran bundle JavaScript | Di bawah 250 KB gzip |
| Ketersediaan | Mengikuti SLA Cloudflare, tanpa cold sleep |
| Konflik edit | Last write wins (pengeditan bersamaan jarang terjadi di skala ini) |

Catatan efisiensi D1: `GET /api/items` memakai indeks dan satu query. Jangan memuat ulang otomatis terlalu sering (refetch saat jendela kembali fokus sudah cukup).

---

## 12. PENANGANAN ERROR

| Skenario | Pesan ke Pengguna | Aksi Sistem |
|----------|-------------------|-------------|
| Kode akses salah | "Kode akses salah." | 401, catat ke login_attempts |
| Terlalu banyak percobaan | "Terlalu banyak percobaan. Coba lagi dalam beberapa menit." | 429 |
| Sesi habis atau tidak ada | (tanpa pesan) | 401, frontend mengarahkan ke /login |
| Validasi gagal | Pesan di bawah kolom yang salah | 400 dengan detail per kolom |
| Nama kategori sudah ada | "Nama kategori sudah dipakai." | 409 |
| Item tidak ditemukan (sudah dihapus orang lain) | "Item sudah tidak ada." | 404, daftar di-refresh |
| Dekripsi gagal (kunci salah atau data rusak) | "Isi rahasia tidak bisa dibuka." | 500, catat log tanpa isi rahasia |
| Batas harian D1 atau Workers terlewati | "Layanan sedang penuh, coba lagi besok." | 503 |
| Jaringan putus | "Tidak ada koneksi. Coba lagi." | Tombol coba lagi, data yang sudah dimuat tetap tampil |

---

## 13. PRIORITAS DAN FASE PENGERJAAN

Estimasi untuk satu developer dibantu AI agent. Setiap fase diakhiri uji dan perbaikan sebelum lanjut.

| Fase | Cakupan | Estimasi | Output yang Diperiksa |
|------|---------|----------|-----------------------|
| 1. Fondasi | Setup project, D1 dan migrasi, middleware auth, halaman login, guard frontend | Hari 1 sampai 2 | Bisa masuk dengan kode, API menolak tanpa sesi |
| 2. Inti (MVP) | CRUD kategori, CRUD item Link dan Catatan, pin, pencarian, tampilan lynk.id | Hari 3 sampai 5 | Semua alur di bagian 8 berjalan di HP dan laptop |
| 3. Item Rahasia | Enkripsi, endpoint reveal, SecretCard, konfirmasi hapus | Hari 6 sampai 7 | Payload terenkripsi di D1, tidak ada di response list |
| 4. Uji dan rilis | Uji manual lintas perangkat, deploy produksi, set secret produksi, bagikan ke grup | Hari 8 sampai 9 | URL produksi dipakai anggota |
| 5. Revisi | Terima masukan anggota, perbaiki, pertimbangkan F-101 dan F-102 | Hari 10 sampai 11 | Daftar revisi selesai |

---

## 14. RISIKO PROJECT

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|--------------|--------|----------|
| Kode akses bocor atau diteruskan ke orang luar | Sedang | Tinggi | Ganti `ACCESS_CODE` dan `SESSION_SECRET` bila ada yang mencurigakan. Jangan simpan akun penting. |
| Anggota salah hapus item | Sedang | Sedang | Dialog konfirmasi (MVP), lalu fitur Sampah (F-101) |
| Edit bersamaan saling menimpa | Rendah | Rendah | Last write wins, refetch saat fokus |
| Batas gratis D1 atau Workers terlewati | Rendah | Sedang | Data kecil, satu query list, indeks, alert email dari Cloudflare |
| Kunci `SECRET_ENC_KEY` hilang atau terganti | Rendah | Tinggi | Simpan cadangan kunci di tempat aman di luar repository. Kunci hilang berarti item rahasia tidak bisa dibuka lagi. |
| Masalah build di Cloudflare Pages | Rendah | Sedang | Pakai Vite (bukan Next.js), kunci versi dependensi, build lokal sebelum deploy |
| Link rusak atau kedaluwarsa (Drive, Canva) | Sedang | Rendah | Catatan di deskripsi, edit saat ketahuan |

---

## 15. PROMPT IMPLEMENTASI UNTUK AI CODING

Berikan prompt berurutan, satu per satu, dan uji hasil tiap prompt sebelum lanjut ke berikutnya.

### 15.1 Prompt Setup Awal
```
Kamu adalah senior full-stack developer. Bangun project "KKN Hub" sesuai PRD yang saya lampirkan
(PRD-KKN-Hub.md). Ikuti PRD persis, jangan tambah fitur di luar PRD.

Cara kerja:
1. Tulis dulu asumsi yang kamu pakai.
2. Tampilkan struktur folder.
3. Tampilkan kode lengkap per file, dengan komentar inline singkat.
4. Akhiri dengan langkah setup dan cara menjalankan.
Tanya saya hanya bila ada hal yang benar-benar ambigu.

Stack (wajib diikuti persis):
- Frontend: Vite + React 18 + TypeScript + Tailwind CSS + TanStack Query + React Router
- Backend: Hono di Cloudflare Pages Functions (entry: functions/api/[[route]].ts, basePath /api)
- Validasi: Zod
- Database: Cloudflare D1 + Drizzle ORM (migrasi via drizzle-kit dan wrangler d1 migrations)
- Hosting: Cloudflare Pages
- Tanpa Next.js, tanpa library UI berat

Struktur folder yang diinginkan:
kkn-hub/
  functions/api/[[route]].ts      # entry Hono untuk Pages Functions
  server/
    app.ts                        # instance Hono, pasang middleware dan route
    db/schema.ts                  # skema Drizzle (sesuai PRD bagian 7.3)
    db/client.ts                  # helper membuat drizzle dari binding D1
    lib/crypto.ts                 # enkripsi dan dekripsi AES-GCM (Web Crypto)
    lib/validation.ts             # skema Zod
    lib/response.ts               # helper format { success, data, message }
    middleware/auth.ts            # cek cookie sesi bertanda tangan
    routes/auth.ts
    routes/categories.ts
    routes/items.ts
  src/
    main.tsx
    App.tsx                       # router dan guard
    lib/api.ts                    # wrapper fetch ke /api
    pages/LoginPage.tsx
    pages/HomePage.tsx
    pages/CategoriesPage.tsx
    components/                   # LinkCard, NoteCard, SecretCard, ItemFormSheet, dll
  drizzle/                        # file migrasi hasil generate
  drizzle.config.ts
  wrangler.toml
  .dev.vars.example               # contoh secret lokal (jangan commit .dev.vars)

Konvensi kode:
- TypeScript strict. Semua fungsi punya komentar singkat.
- Semua secret lewat environment: ACCESS_CODE, SESSION_SECRET, SECRET_ENC_KEY. Tidak ada secret di kode.
- Semua response API berformat { success: boolean, data: any, message: string }.
- Kode bersih, mudah dibaca, nama jelas, tanpa abstraksi berlebihan.
- Antarmuka berbahasa Indonesia.
- Pastikan versi dependensi dikunci dan build lokal berhasil sebelum deploy.
```

### 15.2 Prompt Modul 1: Akses (Fondasi)
```
Buat modul Akses sesuai PRD bagian 3, 7.2, 10.1, dan 12.

Backend:
1. POST /api/auth/login: body { code }. Bandingkan dengan env.ACCESS_CODE secara waktu konstan
   (hash SHA-256 kedua sisi lalu bandingkan). Jika benar, setSignedCookie (hono/cookie) bernama
   "kkn_session" dengan SESSION_SECRET: HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age 30 hari.
   Untuk pengembangan lokal (http), Secure boleh dimatikan lewat pengecekan environment.
2. Pembatasan: tabel login_attempts. Jika ada 5 percobaan gagal dari IP (header CF-Connecting-IP)
   dalam 15 menit, balas 429. Catat setiap percobaan gagal. Hapus baris lebih tua dari 1 hari saat login.
3. POST /api/auth/logout: hapus cookie. GET /api/auth/me: 200 jika cookie valid, selain itu 401.
4. Middleware auth: lindungi semua /api/* kecuali /api/auth/login.
5. Tambahkan header Cache-Control: no-store untuk semua response API.

Frontend:
- LoginPage: satu kolom kode akses (type password), tombol "Masuk", pesan error sesuai PRD bagian 12.
- Guard di App.tsx: panggil /api/auth/me, jika 401 arahkan ke /login.
- Tambahkan <meta name="robots" content="noindex"> di index.html.

Sertakan migrasi untuk tabel login_attempts dan langkah menjalankannya secara lokal.
```

### 15.3 Prompt Modul 2: Kategori dan Item Link/Catatan
```
Buat modul Kategori dan Item (tipe link dan note saja dulu) sesuai PRD bagian 4, 5.1, 7, 9, dan 10.2.

Backend:
- Route categories: GET, POST, PATCH /:id, DELETE /:id (sesuai kontrak API di bagian 7.4).
  Nama unik tanpa membedakan huruf besar kecil, respons 409 bila bentrok.
- Route items: GET (semua item, tanpa secret_payload), POST, PATCH /:id, DELETE /:id.
  Validasi Zod sesuai tabel di bagian 10.2. Perbarui updated_at saat edit.
- Hapus kategori: item terkait otomatis category_id = NULL (ON DELETE SET NULL).

Frontend:
- HomePage dengan layout bagian 9.2: header, pencarian, chip kategori, bagian "Disematkan",
  daftar per kategori, grup "Lainnya" untuk item tanpa kategori, tombol "+" mengambang.
- Komponen LinkCard dan NoteCard sesuai bagian 9.3. Menu titik tiga: Ubah, Sematkan/Lepas sematan, Hapus.
- ItemFormSheet untuk tambah dan ubah (bottom sheet di HP, modal di laptop).
- Pencarian dan filter kategori di sisi klien. Pencarian mencocokkan judul, deskripsi, URL, isi catatan.
- CategoriesPage: tambah, ganti nama, hapus (dengan ConfirmDialog).
- ConfirmDialog sebelum hapus item dan kategori. Toast untuk sukses dan error.
- Layout satu kolom tengah, max-width sekitar 560 px, mobile-first, diuji di 360 px dan 1280 px.

Gunakan TanStack Query untuk data. Invalidate query setelah mutasi.
```

### 15.4 Prompt Modul 3: Item Rahasia
```
Tambahkan tipe item "secret" sesuai PRD bagian 4 (US-040), 10.3, dan 12.

Backend:
- lib/crypto.ts: fungsi encryptSecret(plainJson, base64Key) dan decryptSecret(payload, base64Key)
  memakai AES-GCM 256 bit via Web Crypto. IV acak 12 byte. Simpan base64(iv + ciphertext).
  Kunci diambil dari env.SECRET_ENC_KEY (32 byte, base64).
- POST dan PATCH /api/items untuk tipe secret: terima { title, category_id, username, password },
  enkripsi JSON { username, password } ke secret_payload. Jangan simpan plaintext di kolom mana pun.
- GET /api/items: JANGAN sertakan secret_payload (pastikan lewat select kolom eksplisit, bukan select *).
- GET /api/items/:id/reveal: hanya untuk tipe secret, dekripsi dan kembalikan { username, password }.
  Jika dekripsi gagal balas 500 dengan pesan sesuai bagian 12, tanpa mencatat isi rahasia di log.

Frontend:
- SecretCard: judul, teks "Disembunyikan", tombol "Tampilkan". Setelah terbuka tampilkan username
  dan password dengan tombol salin masing-masing, otomatis tersembunyi lagi setelah 30 detik.
- Tambah pilihan tipe "Rahasia" di ItemFormSheet. Saat ubah, kolom password dikosongkan; jika tidak
  diisi ulang, password lama dipertahankan (backend mendekripsi, menggabungkan, lalu mengenkripsi ulang).
- Pencarian untuk item rahasia hanya mencocokkan judul.

Sertakan contoh perintah membuat SECRET_ENC_KEY (openssl rand -base64 32) dan tes sederhana untuk
memastikan enkripsi lalu dekripsi menghasilkan data semula.
```

### 15.5 Prompt Modul 4: Deploy
```
Siapkan deploy ke Cloudflare Pages sesuai PRD.

1. wrangler.toml: nama project, pages_build_output_dir = "dist", binding D1 bernama DB.
2. Jelaskan langkah: buat database D1 (wrangler d1 create), jalankan migrasi lokal dan remote,
   hubungkan repo GitHub ke Cloudflare Pages (build command: npm run build, output: dist),
   dan set secret produksi (ACCESS_CODE, SESSION_SECRET, SECRET_ENC_KEY) di dashboard atau lewat wrangler.
3. Pastikan binding DB terpasang untuk environment production dan preview.
4. Berikan checklist uji pasca-deploy: login benar dan salah, pembatasan 5 percobaan, tambah/ubah/hapus
   tiap tipe item, reveal item rahasia, cek bahwa response GET /api/items tidak memuat secret_payload,
   cek di HP dan laptop.
Cek dokumentasi Cloudflare terbaru untuk sintaks wrangler dan Pages Functions sebelum menulis perintah.
```

---

## CHECKLIST KUALITAS PRD

### Kelengkapan
- [x] Semua 15 bagian PRD terisi
- [x] Asumsi ditulis eksplisit (bagian 1.5)
- [x] Ringkasan 3 baris di awal

### Kejelasan
- [x] Acceptance criteria dapat diuji
- [x] Kontrak API dan skema database lengkap
- [x] Hal yang belum pasti ditandai `[PERLU KONFIRMASI]`: nama aplikasi/kelompok (A7) dan warna aksen atau logo (bagian 9.4)

### Siap Eksekusi
- [x] Prompt implementasi tersedia untuk setup dan 4 modul
- [x] Fase pengerjaan realistis, risiko dan mitigasi tercantum

## REKOMENDASI LANGKAH PERTAMA

1. Buat akun Cloudflare gratis (jika belum) dan repo GitHub kosong bernama `kkn-hub`.
2. Pilih kode akses kelompok dan tentukan nama tampilan aplikasi (isi `[PERLU KONFIRMASI]` di atas).
3. Berikan file PRD ini beserta **Prompt Setup Awal (15.1)** ke AI coding agent, lalu lanjutkan dengan Prompt Modul 1 sampai 4 secara berurutan. Uji tiap modul sebelum lanjut.
