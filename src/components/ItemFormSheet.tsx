// src/components/ItemFormSheet.tsx — Formulir Tambah/Ubah Item (Clean Modal Dialog)
import { useState, useEffect } from 'react';
import type { Category, ItemBase } from '../lib/api';

export type ItemType = 'link' | 'note' | 'secret';

interface ItemFormData {
  type: ItemType;
  title: string;
  categoryId: string | null;
  // Link
  url: string;
  description: string;
  // Note
  content: string;
  // Secret
  username: string;
  password: string;
}

interface ItemFormSheetProps {
  open: boolean;
  categories: Category[];
  editItem?: ItemBase | null;
  onSubmit: (data: ItemFormData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const TYPE_OPTIONS: { value: ItemType; label: string; desc: string }[] = [
  { value: 'link', label: 'Tautan Web', desc: 'Google Drive, Dokumen, URL' },
  { value: 'note', label: 'Catatan Lapangan', desc: 'Rundown, Kontak, Memo' },
  { value: 'secret', label: 'Akun Bersama', desc: 'Email, Instagram, Password' },
];

export default function ItemFormSheet({
  open,
  categories,
  editItem,
  onSubmit,
  onClose,
  isLoading,
}: ItemFormSheetProps) {
  const [form, setForm] = useState<ItemFormData>({
    type: 'link',
    title: '',
    categoryId: null,
    url: '',
    description: '',
    content: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (editItem) {
      setForm({
        type: editItem.type as ItemType,
        title: editItem.title,
        categoryId: editItem.categoryId,
        url: editItem.url || '',
        description: editItem.description || '',
        content: editItem.content || '',
        username: '',
        password: '',
      });
    } else {
      setForm({
        type: 'link',
        title: '',
        categoryId: null,
        url: '',
        description: '',
        content: '',
        username: '',
        password: '',
      });
    }
    setErrors({});
  }, [editItem, open]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.title.trim()) errs.title = 'Judul wajib diisi';
    else if (form.title.length > 100) errs.title = 'Judul maksimal 100 karakter';

    if (form.type === 'link') {
      if (!form.url.trim()) errs.url = 'URL tautan wajib diisi';
      else if (!/^https?:\/\//i.test(form.url)) errs.url = 'URL harus diawali http:// atau https://';
      if (form.description.length > 300) errs.description = 'Deskripsi maksimal 300 karakter';
    }

    if (form.type === 'note') {
      if (!form.content.trim()) errs.content = 'Isi catatan wajib diisi';
      else if (form.content.length > 5000) errs.content = 'Isi catatan maksimal 5000 karakter';
    }

    if (form.type === 'secret') {
      if (!editItem && !form.password.trim()) errs.password = 'Password wajib diisi';
      else if (form.password.length > 500) errs.password = 'Password maksimal 500 karakter';
      if (form.username.length > 200) errs.username = 'Username maksimal 200 karakter';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-surface-900 border border-surface-700 rounded-lg shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-sheet">
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-800">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-surface-400 block">
                {editItem ? 'Edit Dokumen' : 'Dokumen Baru'}
              </span>
              <h2 className="text-base font-bold text-surface-100">
                {editItem ? `Ubah: ${editItem.title}` : 'Tambah ke KKN Hub'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded text-surface-400 hover:text-white hover:bg-surface-800 flex items-center justify-center transition-colors"
              aria-label="Tutup"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Type Selector (New items only) */}
          {!editItem && (
            <div>
              <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                Tipe Item
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-950 border border-surface-800 rounded">
                {TYPE_OPTIONS.map((opt) => {
                  const isActive = form.type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                      className={`py-2 px-2 rounded text-xs font-medium text-center transition-colors ${
                        isActive
                          ? 'bg-surface-800 text-white font-semibold shadow-xs'
                          : 'text-surface-400 hover:text-surface-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Judul Item <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input-field"
              placeholder={
                form.type === 'link'
                  ? 'Contoh: Folder Drive Proposal & LPJ Desa'
                  : form.type === 'note'
                  ? 'Contoh: Rundown Acara di Bale Banjar'
                  : 'Contoh: Akun Instagram Resmi KKN'
              }
              maxLength={100}
              autoFocus
            />
            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-surface-300">
                Kategori
              </label>
              <a
                href="/kategori"
                className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
                title="Buka halaman kelola kategori"
              >
                + Kelola / Tambah Kategori
              </a>
            </div>
            <select
              value={form.categoryId || ''}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value || null }))}
              className="input-field cursor-pointer"
            >
              <option value="">Tanpa Kategori (Grup Lainnya)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Link Fields */}
          {form.type === 'link' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                  Tautan URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  className="input-field"
                  placeholder="https://drive.google.com/..."
                  maxLength={2000}
                />
                {errors.url && <p className="text-rose-400 text-xs mt-1">{errors.url}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                  Keterangan Singkat <span className="text-surface-500 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="input-field"
                  placeholder="Catatan mengenai berkas atau kegunaan tautan"
                  maxLength={300}
                />
                {errors.description && <p className="text-rose-400 text-xs mt-1">{errors.description}</p>}
              </div>
            </div>
          )}

          {/* Note Field */}
          {form.type === 'note' && (
            <div>
              <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                Isi Catatan <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className="input-field min-h-[140px] resize-y font-sans leading-relaxed"
                placeholder="Tuliskan jadwal, rincian teknis posko, atau kontak warga..."
                maxLength={5000}
                rows={5}
              />
              {errors.content && <p className="text-rose-400 text-xs mt-1">{errors.content}</p>}
            </div>
          )}

          {/* Secret Fields */}
          {form.type === 'secret' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                  Username / ID / Email <span className="text-surface-500 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="input-field font-mono"
                  placeholder="admin.kkn@gmail.com atau @kkn_desa"
                  maxLength={200}
                />
                {errors.username && <p className="text-rose-400 text-xs mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                  Password / Sandi
                  {editItem && <span className="text-surface-500 font-normal ml-1">(kosongkan bila tetap)</span>}
                  {!editItem && <span className="text-rose-400 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input-field font-mono"
                  placeholder={editItem ? 'Biarkan kosong bila tidak diubah' : 'Kata sandi akun bersama'}
                  maxLength={500}
                />
                {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambahkan Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
