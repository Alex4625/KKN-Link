# KKN Hub 🚀

**Pusat Link, Catatan, dan Item Rahasia Kelompok KKN**  
*Web app modern bergaya lynk.id untuk satu kelompok KKN, aman dengan satu kode akses bersama, 100% stack gratis di Cloudflare Pages.*

---

## 🌟 Fitur Utama

- **🚪 Gerbang Kode Akses Tunggal**: Tanpa registrasi rumit. Seluruh anggota masuk menggunakan satu kode akses bersama (diingat 30 hari via signed session cookie). Dilengkapi proteksi *rate-limiting* (maksimal 5x percobaan gagal per IP per 15 menit).
- **📂 Manajemen Kategori**: Buat, ubah nama (*inline*), dan hapus kategori. Menghapus kategori tidak menghapus item (otomatis berpindah ke grup "Lainnya").
- **🔗 Kartu Link Interaktif**: Simpan tautan penting (Google Drive, Canva, Docs, Form) dengan judul, domain otomatis, favicon, deskripsi, dan tombol salin link.
- **📝 Kartu Catatan (Pengingat & Jadwal)**: Teks multibaris dengan pratinjau ringkas (*clamp 3 baris* & ekspansi *"Lihat selengkapnya"*), serta tombol salin catatan.
- **🔒 Kartu Rahasia (Akun Bersama)**: Simpan kredensial akun kelompok (Canva bersama, akun sosmed desa). Data disimpan **terenkripsi AES-GCM 256-bit** di Cloudflare D1. Di daftar umum, data rahasia tidak pernah dikirimkan ke browser. Menekan *"Tampilkan"* akan mendekripsi data di server dan otomatis menyembunyikan kembali setelah 30 detik.
- **📌 Pinning & Pencarian Cepat**: Sematkan (*pin*) item prioritas ke bagian teratas. Pencarian instan mencocokkan judul, deskripsi, link, dan isi catatan secara *real-time*.
- **📱 Desain Responsif Ala lynk.id**: Mobile-first, single-column terpusat (lebar maksimal 560px), dark glassmorphism modern, animasi mikro yang halus, dan konfirmasi hapus via modal.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS |
| **State & Fetching** | TanStack Query v5 + React Router v7 |
| **Backend API** | Hono v4 di Cloudflare Pages Functions (`/functions/api/[[route]].ts`) |
| **Database & ORM** | Cloudflare D1 (SQLite) + Drizzle ORM |
| **Enkripsi** | AES-GCM 256-bit via Web Crypto API bawaan Cloudflare Workers |
| **Validasi** | Zod v4 |
| **Hosting** | Cloudflare Pages |

---

## 📁 Struktur Folder

```text
KKN-Link/
├── functions/
│   └── api/
│       └── [[route]].ts          # Entry point Hono untuk Cloudflare Pages Functions
├── server/
│   ├── app.ts                    # Instance Hono, konfigurasi middleware & route
│   ├── db/
│   │   ├── client.ts             # Inisialisasi Drizzle ORM dari binding D1
│   │   └── schema.ts             # Skema tabel (categories, items, login_attempts)
│   ├── lib/
│   │   ├── crypto.ts             # Helper AES-GCM 256-bit (encryptSecret & decryptSecret)
│   │   ├── response.ts           # Standard format response { success, data, message }
│   │   └── validation.ts         # Skema validasi Zod
│   ├── middleware/
│   │   └── auth.ts               # Guard cookie sesi bertanda tangan & security headers
│   └── routes/
│       ├── auth.ts               # POST /login, POST /logout, GET /me
│       ├── categories.ts         # GET, POST, PATCH, DELETE /categories
│       └── items.ts              # GET, POST, PATCH, DELETE /items, GET /items/:id/reveal
├── src/
│   ├── components/
│   │   ├── CardMenu.tsx          # Menu titik tiga (Ubah, Sematkan, Hapus)
│   │   ├── CategoryChips.tsx     # Chip horizontal kategori
│   │   ├── ConfirmDialog.tsx     # Modal dialog konfirmasi hapus
│   │   ├── ItemFormSheet.tsx     # Bottom sheet (HP) / Modal (Desktop) tambah & edit item
│   │   ├── LinkCard.tsx          # Komponen kartu link
│   │   ├── NoteCard.tsx          # Komponen kartu catatan
│   │   ├── SearchInput.tsx       # Kolom pencarian instan
│   │   ├── SecretCard.tsx        # Komponen kartu rahasia dengan timer 30 detik
│   │   └── Toast.tsx             # Sistem toast notifikasi
│   ├── lib/
│   │   └── api.ts                # API client wrapper fetch
│   ├── pages/
│   │   ├── HomePage.tsx          # Halaman utama beranda lynk.id
│   │   ├── LoginPage.tsx         # Halaman login kode akses
│   │   └── CategoriesPage.tsx    # Halaman kelola kategori
│   ├── App.tsx                   # Routing & AuthGuard
│   ├── main.tsx                  # Entry React DOM
│   └── index.css                 # Design token, glassmorphism & Tailwind
├── drizzle/                      # File migrasi database SQLite
├── drizzle.config.ts             # Konfigurasi Drizzle Kit
├── wrangler.toml                 # Konfigurasi Cloudflare Pages & binding D1
├── .dev.vars.example             # Template variabel environment lokal
└── package.json
```

---

## 🚀 Panduan Setup & Menjalankan Lokal

### 1. Prasyarat
- Node.js versi 18+ atau 20+
- npm terpasang

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Lokal (`.dev.vars`)
Salin file `.dev.vars.example` menjadi `.dev.vars`:
```bash
cp .dev.vars.example .dev.vars
```

Buat nilai secret acak untuk `SESSION_SECRET` dan `SECRET_ENC_KEY`:
```bash
# Di terminal Linux/macOS/Git Bash:
openssl rand -base64 32

# Atau via Node.js di terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Isi file `.dev.vars`:
```ini
ACCESS_CODE=kkn-sukamaju-2026
SESSION_SECRET=<hasil_generate_32_byte_base64>
SECRET_ENC_KEY=<hasil_generate_32_byte_base64>
```

### 4. Setup Database D1 Lokal & Migrasi
Jalankan migrasi ke D1 lokal:
```bash
npx wrangler d1 execute kkn-hub-db --local --file=./drizzle/0000_initial_schema.sql
```

### 5. Jalankan Dev Server
Untuk menjalankan frontend dan API Hono (Pages Functions) secara lokal menggunakan Wrangler:
```bash
npm run pages:dev
```
Aplikasi akan aktif di `http://localhost:8788`.

Atau jika ingin menjalankan Vite dev server:
```bash
npm run dev
```

---

## ☁️ Panduan Deploy ke Cloudflare Pages

### 1. Buat Database D1 di Cloudflare
```bash
npx wrangler d1 create kkn-hub-db
```
Salin `database_id` yang dihasilkan ke dalam file `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "kkn-hub-db"
database_id = "MASUKKAN_DATABASE_ID_DARI_CLOUDFLARE_DI_SINI"
```

### 2. Jalankan Migrasi ke Database Remote
```bash
npx wrangler d1 execute kkn-hub-db --remote --file=./drizzle/0000_initial_schema.sql
```

### 3. Hubungkan Repository ke Cloudflare Pages
1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Pilih repository `kkn-hub`.
3. Pengaturan Build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Di bagian **Environment Variables** (Settings > Environment Variables), tambahkan:
   - `ACCESS_CODE` = *Kode akses pilihan kelompok (misal: `kkn-desa-2026`)*
   - `SESSION_SECRET` = *Hasil `openssl rand -base64 32`*
   - `SECRET_ENC_KEY` = *Hasil `openssl rand -base64 32`*
5. Di bagian **Settings > Functions > D1 database bindings**:
   - Variable name: `DB`
   - D1 database: `kkn-hub-db`

---

## 🧪 Checklist Pengujian Pasca-Deploy

- [x] **Login Kode Akses**:
  - Memasukkan kode salah menampilkan pesan *"Kode akses salah."*
  - Memasukkan kode salah 5x dari IP yang sama menghasilkan status 429 *"Terlalu banyak percobaan. Coba lagi dalam beberapa menit."*
  - Memasukkan kode benar mengarahkan ke beranda dan menyimpan cookie `kkn_session` 30 hari.
- [x] **CRUD Kategori**:
  - Tambah kategori baru dengan nama unik.
  - Ubah nama kategori (*inline edit*).
  - Hapus kategori memunculkan dialog konfirmasi; item yang ada di kategori tersebut otomatis beralih ke "Lainnya".
- [x] **CRUD Item Link & Note**:
  - Tambah item Link (validasi skema `http://` atau `https://`).
  - Menekan badan kartu Link membuka tab baru (`rel="noopener noreferrer"`).
  - Tambah item Catatan (isi teks mempertahankan *newline*).
  - Sematkan (*pin*) kartu ke bagian "Disematkan" di atas.
  - Pencarian memfilter secara instan.
- [x] **Keamanan Item Rahasia**:
  - Tambah item Rahasia (username + password).
  - Cek Network tab browser pada request `GET /api/items`: field `secret_payload` tidak pernah dikirimkan.
  - Tekan tombol *"Tampilkan"*: data terungkap dan timer 30 detik mulai berjalan.
  - Salin username & password ke clipboard.
- [x] **Responsivitas**:
  - Tampilan rapi dan nyaman digunakan di layar HP (360px) maupun layar laptop (1280px).
