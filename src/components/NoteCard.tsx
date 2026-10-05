// src/components/NoteCard.tsx — Catatan Lapangan, Rundown, & Kontak Kerja Posko
import { useState } from 'react';
import { useToast } from './Toast';
import CardMenu from './CardMenu';
import type { ItemBase } from '../lib/api';

interface NoteCardProps {
  item: ItemBase;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

export default function NoteCard({ item, onEdit, onTogglePin, onDelete }: NoteCardProps) {
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const content = item.content || '';
  const lines = content.split('\n');
  const isLong = lines.length > 5 || content.length > 240;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast('Isi catatan disalin');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`kkn-card p-4 sm:p-4.5 flex flex-col justify-between gap-3 ${
        item.isPinned ? 'kkn-card-pinned' : ''
      }`}
    >
      <div>
        {/* Baris Atas: Judul Catatan & Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-surface-100 leading-snug">
              {item.title}
            </h3>
          </div>

          <CardMenu
            isPinned={!!item.isPinned}
            onEdit={onEdit}
            onTogglePin={onTogglePin}
            onDelete={onDelete}
          />
        </div>

        {/* Isi Catatan dengan Format Rapi */}
        <div className="mt-2.5 pt-2 border-t border-surface-850">
          <p
            className={`text-xs text-surface-300 whitespace-pre-wrap font-sans leading-relaxed ${
              !expanded && isLong ? 'line-clamp-4' : ''
            }`}
          >
            {content}
          </p>

          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-bali-gold text-xs font-medium mt-2 hover:underline inline-flex items-center gap-1"
            >
              <span>{expanded ? 'Tampilkan ringkas' : 'Baca selengkapnya'}</span>
              <svg
                className={`w-3 h-3 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Baris Bawah: Tombol Salin Isi */}
      <div className="pt-2 border-t border-surface-850 flex items-center justify-between text-xs text-surface-400">
        <span className="text-[11px] font-mono text-surface-500">Catatan Posko</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-surface-400 hover:text-surface-200 transition-colors inline-flex items-center gap-1 py-1 px-1.5 rounded hover:bg-surface-850"
          title="Salin isi catatan"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
          </svg>
          <span>{copied ? 'Tersalin' : 'Salin Catatan'}</span>
        </button>
      </div>
    </div>
  );
}
