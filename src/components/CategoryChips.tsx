// src/components/CategoryChips.tsx — Filter kategori dokumen & kegiatan KKN
import type { Category } from '../lib/api';

interface CategoryChipsProps {
  categories: Category[];
  selected: string | null; // null = "Semua"
  onSelect: (categoryId: string | null) => void;
  counts?: Map<string | null, number>;
  onManage?: () => void;
}

export default function CategoryChips({ categories, selected, onSelect, counts, onManage }: CategoryChipsProps) {
  const totalCount = counts ? Array.from(counts.values()).reduce((a, b) => a + b, 0) : undefined;

  return (
    <div className="w-full border-b border-surface-800 pb-2">
      <div
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar py-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Tab "Semua" */}
        <button
          onClick={() => onSelect(null)}
          className={`filter-tab ${selected === null ? 'filter-tab-active' : ''}`}
        >
          <span>Semua Berkas</span>
          {totalCount !== undefined && (
            <span className="text-xs font-mono text-surface-400 opacity-80">
              ({totalCount})
            </span>
          )}
        </button>

        {/* Tab per Kategori */}
        {categories.map((cat) => {
          const isSelected = selected === cat.id;
          const count = counts?.get(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`filter-tab ${isSelected ? 'filter-tab-active' : ''}`}
            >
              <span className="truncate max-w-[180px]">{cat.name}</span>
              {count !== undefined && (
                <span className="text-xs font-mono text-surface-400 opacity-80">
                  ({count})
                </span>
              )}
            </button>
          );
        })}

        {/* Tombol Kelola Kategori */}
        {onManage && (
          <button
            onClick={onManage}
            className="filter-tab text-sky-400 hover:text-white border border-dashed border-surface-700 hover:border-surface-600 flex items-center gap-1 shrink-0"
            title="Kelola & Tambah Kategori Baru"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Kelola Kategori</span>
          </button>
        )}
      </div>
    </div>
  );
}
