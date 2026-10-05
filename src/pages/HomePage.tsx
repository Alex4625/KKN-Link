// src/pages/HomePage.tsx — Beranda Kerja & Arsip KKN (Anti AI-Slop Human Design)
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, categoriesApi, itemsApi, ApiError, type ItemBase, type Category } from '../lib/api';
import { useToast } from '../components/Toast';
import SearchInput from '../components/SearchInput';
import CategoryChips from '../components/CategoryChips';
import LinkCard from '../components/LinkCard';
import NoteCard from '../components/NoteCard';
import SecretCard from '../components/SecretCard';
import ItemFormSheet from '../components/ItemFormSheet';
import ConfirmDialog from '../components/ConfirmDialog';

export default function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<ItemBase | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ItemBase | null>(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  // Queries
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.list(),
  });

  const cats = categoriesData?.data || [];
  const allItems = itemsData?.data || [];

  // Hitung jumlah item per kategori
  const categoryCounts = useMemo(() => {
    const map = new Map<string | null, number>();
    for (const item of allItems) {
      const key = item.categoryId;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [allItems]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => itemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setFormOpen(false);
      showToast('Item berhasil disimpan');
    },
    onError: (err: unknown) =>
      showToast(err instanceof ApiError ? err.message : 'Gagal menyimpan item', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => itemsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setFormOpen(false);
      setEditItem(null);
      showToast('Item berhasil diperbarui');
    },
    onError: (err: unknown) =>
      showToast(err instanceof ApiError ? err.message : 'Gagal memperbarui item', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => itemsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setDeleteTarget(null);
      showToast('Item berhasil dihapus');
    },
    onError: (err: unknown) =>
      showToast(err instanceof ApiError ? err.message : 'Gagal menghapus item', 'error'),
  });

  const togglePinMutation = useMutation({
    mutationFn: (item: ItemBase) =>
      itemsApi.update(item.id, { isPinned: item.isPinned ? 0 : 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (err: unknown) =>
      showToast(err instanceof ApiError ? err.message : 'Gagal mengubah sematan', 'error'),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });

  // Hotkey 'N' untuk buat item baru
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditItem(null);
        setFormOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    let result = allItems;

    if (selectedCategory !== null) {
      result = result.filter((item) => item.categoryId === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) => {
        if (item.title.toLowerCase().includes(q)) return true;
        if (item.type === 'link') {
          if (item.description?.toLowerCase().includes(q)) return true;
          if (item.url?.toLowerCase().includes(q)) return true;
        }
        if (item.type === 'note') {
          if (item.content?.toLowerCase().includes(q)) return true;
        }
        return false;
      });
    }

    return result;
  }, [allItems, search, selectedCategory]);

  const pinnedItems = filteredItems.filter((i) => i.isPinned);
  const unpinnedItems = filteredItems.filter((i) => !i.isPinned);

  // Group unpinned by category
  const groupedItems = useMemo(() => {
    const groups: { category: Category | null; items: ItemBase[] }[] = [];
    const categoryMap = new Map<string | null, ItemBase[]>();

    for (const item of unpinnedItems) {
      const key = item.categoryId;
      if (!categoryMap.has(key)) categoryMap.set(key, []);
      categoryMap.get(key)!.push(item);
    }

    for (const cat of cats) {
      const catItems = categoryMap.get(cat.id);
      if (catItems && catItems.length > 0) {
        groups.push({ category: cat, items: catItems });
        categoryMap.delete(cat.id);
      }
    }

    const uncategorized = categoryMap.get(null) || [];
    if (uncategorized.length > 0) {
      groups.push({ category: null, items: uncategorized });
    }

    return groups;
  }, [unpinnedItems, cats]);

  const renderCard = (item: ItemBase) => {
    const commonProps = {
      key: item.id,
      item,
      onEdit: () => {
        setEditItem(item);
        setFormOpen(true);
      },
      onTogglePin: () => togglePinMutation.mutate(item),
      onDelete: () => setDeleteTarget(item),
    };

    switch (item.type) {
      case 'link':
        return <LinkCard {...commonProps} />;
      case 'note':
        return <NoteCard {...commonProps} />;
      case 'secret':
        return <SecretCard {...commonProps} />;
      default:
        return null;
    }
  };

  const handleFormSubmit = (formData: any) => {
    const payload: Record<string, unknown> = {
      type: formData.type,
      title: formData.title,
      categoryId: formData.categoryId,
    };

    if (formData.type === 'link') {
      payload.url = formData.url;
      payload.description = formData.description || null;
    } else if (formData.type === 'note') {
      payload.content = formData.content;
    } else if (formData.type === 'secret') {
      payload.username = formData.username;
      if (formData.password) payload.password = formData.password;
    }

    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="min-h-dvh pb-16 pt-3 sm:pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Utility Header (Bersih, Formal, Tenang) */}
        <header className="py-4 border-b border-surface-800 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-surface-50 tracking-tight">
                KKN Hub
              </h1>
              <span className="text-[11px] font-mono text-surface-200 px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700 font-medium">
                Desa Adat Bali
              </span>
            </div>
            <p className="text-xs text-surface-300 mt-0.5">
              Pusat dokumen, rundown kegiatan posko, & arsip kelompok
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setEditItem(null);
                setFormOpen(true);
              }}
              className="btn-primary text-xs"
              title="Tambah Item Baru (Shortcut: N)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Tambah Item</span>
            </button>

            <button
              onClick={() => navigate('/kategori')}
              className="btn-secondary text-xs"
              title="Kelola Kategori Berkas"
            >
              <svg className="w-3.5 h-3.5 text-surface-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
              <span>Kategori</span>
            </button>

            <button
              onClick={() => setLogoutConfirm(true)}
              className="btn-ghost text-xs text-surface-300 hover:text-rose-300 hover:bg-rose-950/40"
              aria-label="Keluar dari sesi"
              title="Keluar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Search & Category Filter Section */}
        <div className="mb-7 space-y-3">
          <div className="max-w-md">
            <SearchInput value={search} onChange={setSearch} />
          </div>

          <CategoryChips
            categories={cats}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            counts={categoryCounts}
            onManage={() => navigate('/kategori')}
          />
        </div>

        {/* Loading State */}
        {itemsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="kkn-card p-5 h-32 skeleton" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!itemsLoading && filteredItems.length === 0 && (
          <div className="kkn-panel p-8 sm:p-12 max-w-lg mx-auto my-10 text-center">
            <h2 className="text-base font-bold text-surface-100 mb-1.5">
              {search ? 'Tidak ada hasil yang cocok' : 'Belum ada berkas tersimpan'}
            </h2>
            <p className="text-xs text-surface-300 mb-5 leading-relaxed">
              {search
                ? `Tidak ditemukan dokumen atau catatan dengan kata kunci "${search}".`
                : 'Mulai kumpulkan link Google Drive, rundown kegiatan desa, dan kontak darurat kelompok di sini.'}
            </p>

            {search ? (
              <button onClick={() => setSearch('')} className="btn-secondary text-xs">
                Reset Pencarian
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditItem(null);
                  setFormOpen(true);
                }}
                className="btn-primary text-xs"
              >
                + Tambah Item Pertama
              </button>
            )}
          </div>
        )}

        {/* Pinned Section */}
        {pinnedItems.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-surface-700">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                Disematkan Utama ({pinnedItems.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
              {pinnedItems.map(renderCard)}
            </div>
          </section>
        )}

        {/* Categorized Sections */}
        {groupedItems.map((group) => (
          <section
            key={group.category?.id || 'uncategorized'}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-surface-700">
              <h2 className="text-xs font-bold uppercase tracking-wider text-surface-200 font-mono">
                {group.category?.name || 'Dokumen Lainnya'} ({group.items.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
              {group.items.map(renderCard)}
            </div>
          </section>
        ))}
      </div>

      {/* Item Form Modal */}
      <ItemFormSheet
        open={formOpen}
        categories={cats}
        editItem={editItem}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setFormOpen(false);
          setEditItem(null);
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Dokumen"
        message={`Yakin ingin menghapus "${deleteTarget?.title}"? Tindakan ini bersifat permanen.`}
        confirmText="Hapus Permanen"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Logout Confirmation */}
      <ConfirmDialog
        open={logoutConfirm}
        title="Keluar dari Portal"
        message="Anda akan keluar dari sesi KKN Hub. Anda dapat masuk kembali dengan kode akses kelompok."
        confirmText="Keluar"
        onConfirm={() => logoutMutation.mutate()}
        onCancel={() => setLogoutConfirm(false)}
      />
    </div>
  );
}
