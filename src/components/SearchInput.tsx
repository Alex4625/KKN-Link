// src/components/SearchInput.tsx — Kolom pencarian arsip dan dokumen kerja
import { useRef, useEffect } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Cari berkas, rundown kegiatan, atau kontak...',
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: "/" atau "Ctrl+K" untuk fokus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        if (e.key === 'Escape' && document.activeElement === inputRef.current) {
          inputRef.current?.blur();
        }
        return;
      }

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none flex items-center">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9 pr-14 py-2 text-sm"
        id="search-input"
      />

      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value ? (
          <button
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="w-5 h-5 rounded text-surface-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Hapus pencarian"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono text-surface-400 bg-surface-850 border border-surface-800 rounded">
            /
          </kbd>
        )}
      </div>
    </div>
  );
}
