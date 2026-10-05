// src/components/CardMenu.tsx — Menu opsi item dokumen (Clean & Restrained)
import { useState, useRef, useEffect } from 'react';

interface CardMenuProps {
  isPinned: boolean;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

export default function CardMenu({ isPinned, onEdit, onTogglePin, onDelete }: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="w-7 h-7 rounded text-surface-400 hover:text-white hover:bg-surface-800 flex items-center justify-center transition-colors"
        aria-label="Menu Opsi"
        title="Opsi Item"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-44 py-1 rounded-md bg-surface-900 border border-surface-700 shadow-xl z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-surface-200 hover:text-white hover:bg-surface-800 flex items-center gap-2 transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Ubah</span>
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onTogglePin();
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-surface-200 hover:text-white hover:bg-surface-800 flex items-center gap-2 transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-amber-500" fill={isPinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>{isPinned ? 'Lepas Sematan' : 'Sematkan ke Atas'}</span>
          </button>

          <div className="my-1 border-t border-surface-800" />

          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Hapus Item</span>
          </button>
        </div>
      )}
    </div>
  );
}
