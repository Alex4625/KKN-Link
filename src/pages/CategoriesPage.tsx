// src/pages/CategoriesPage.tsx — Pengaturan Kategori Berkas KKN (Clean & Functional)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, itemsApi, ApiError, type Category } from '../lib/api';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [error, setError] = useState('');

  const { data: categoriesData, isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const { data: itemsData } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.list(),
  });

  const categories = categoriesData?.data || [];
  const items = itemsData?.data || [];

  const itemCountMap = new Map<string, number>();
  for (const item of items) {
    if (item.categoryId) {
      itemCountMap.set(item.categoryId, (itemCountMap.get(item.categoryId) || 0) + 1);
    }
  }

  const createMutation = useMutation({
    mutationFn: (name: string) => categoriesApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCatName('');
      setError('');
      showToast('Kategori baru berhasil dibuat');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menambahkan kategori';
      setError(msg);
      showToast(msg, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => categoriesApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCat(null);
      setEditName('');
      showToast('Nama kategori diperbarui');
    },
    onError: (err: unknown) => {
      showToast(err instanceof ApiError ? err.message : 'Gagal mengubah kategori', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setDeleteTarget(null);
      showToast('Kategori berhasil dihapus');
    },
    onError: (err: unknown) => {
      showToast(err instanceof ApiError ? err.message : 'Gagal menghapus kategori', 'error');
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setError('Nama kategori wajib diisi');
      return;
    }
    if (trimmed.length > 40) {
      setError('Nama kategori maksimal 40 karakter');
      return;
    }
    createMutation.mutate(trimmed);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCat(cat);
    setEditName(cat.name);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      showToast('Nama kategori tidak boleh kosong', 'error');
      return;
    }
    if (trimmed.length > 40) {
      showToast('Nama kategori maksimal 40 karakter', 'error');
      return;
    }
    updateMutation.mutate({ id: editingCat.id, name: trimmed });
  };

  return (
    <div className="min-h-dvh pb-16 pt-3 sm:pt-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <header className="py-4 border-b border-surface-800 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="btn-ghost p-1.5"
              aria-label="Kembali ke beranda"
              title="Kembali"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>

            <div>
              <h1 className="text-base font-bold text-surface-50">
                Kelola Kategori Berkas
              </h1>
              <p className="text-xs text-surface-300 mt-0.5">
                Atur klasifikasi tautan dan catatan kegiatan kelompok
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-surface-200 px-2 py-1 rounded bg-surface-800 border border-surface-700 hidden sm:inline">
            {categories.length} Kategori
          </span>
        </header>

        {/* Form Tambah Kategori */}
        <div className="kkn-panel p-4 mb-6">
          <form onSubmit={handleAddSubmit}>
            <label
              htmlFor="cat-name-input"
              className="block text-xs font-bold text-surface-200 mb-2"
            >
              Tambah Kategori Baru
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="cat-name-input"
                type="text"
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  setError('');
                }}
                placeholder="Contoh: Administrasi Desa Adat, Program Kerja, Dokumentasi Budaya"
                className="input-field flex-1"
                maxLength={40}
              />

              <button
                type="submit"
                disabled={createMutation.isPending || !newCatName.trim()}
                className="btn-primary text-xs whitespace-nowrap disabled:opacity-50"
              >
                {createMutation.isPending ? 'Menambahkan...' : '+ Tambah Kategori'}
              </button>
            </div>

            {error && <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>}
          </form>
        </div>

        {/* Daftar Kategori */}
        <div>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-surface-700">
            <h2 className="text-xs font-bold uppercase tracking-wider text-surface-200 font-mono">
              Daftar Kategori Terdaftar
            </h2>
            <span className="text-[11px] text-surface-300">
              Menghapus kategori tidak menghapus isi berkasnya
            </span>
          </div>

          {catsLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 kkn-card skeleton" />
              ))}
            </div>
          )}

          {!catsLoading && categories.length === 0 && (
            <div className="kkn-panel p-8 text-center text-xs text-surface-300">
              Belum ada kategori yang dibuat. Gunakan form di atas untuk membuat kategori baru.
            </div>
          )}

          {!catsLoading && categories.length > 0 && (
            <div className="divide-y divide-surface-700/80 kkn-panel overflow-hidden">
              {categories.map((cat) => {
                const isEditing = editingCat?.id === cat.id;
                const count = itemCountMap.get(cat.id) || 0;

                if (isEditing) {
                  return (
                    <form
                      key={cat.id}
                      onSubmit={handleSaveEdit}
                      className="p-3 flex items-center gap-2 bg-surface-900"
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input-field flex-1 text-xs py-1.5"
                        autoFocus
                        maxLength={40}
                      />
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCat(null)}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        Batal
                      </button>
                    </form>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-800/60 transition-colors"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <span className="text-sm font-bold text-surface-50 truncate">
                        {cat.name}
                      </span>
                      <span className="text-xs font-mono text-surface-300 px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700">
                        {count} berkas
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="text-xs font-semibold text-sky-400 hover:text-white py-1 px-2.5 rounded bg-surface-800 hover:bg-sky-600 border border-surface-700 hover:border-sky-500 transition-colors"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cat)}
                        className="text-xs font-semibold text-rose-400 hover:text-white py-1 px-2.5 rounded bg-rose-950/40 hover:bg-rose-600 border border-rose-800/40 hover:border-rose-500 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Kategori"
        message={`Yakin ingin menghapus kategori "${deleteTarget?.name}"? Berkas di dalamnya akan dipindahkan ke kategori "Lainnya" dan tidak akan terhapus.`}
        confirmText="Hapus Kategori"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
