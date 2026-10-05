// src/components/LinkCard.tsx — Item Tautan / Dokumen Kerja (Clean Editorial Tile)
import { useState } from 'react';
import { useToast } from './Toast';
import CardMenu from './CardMenu';
import type { ItemBase } from '../lib/api';

interface LinkCardProps {
  item: ItemBase;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

export default function LinkCard({ item, onEdit, onTogglePin, onDelete }: LinkCardProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.url) {
      navigator.clipboard.writeText(item.url);
      setCopied(true);
      showToast('Link berhasil disalin');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpen = () => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const domain = item.url ? getDomain(item.url) : '';

  return (
    <div
      className={`kkn-card kkn-card-interactive p-4 sm:p-4.5 flex flex-col justify-between gap-3 ${
        item.isPinned ? 'kkn-card-pinned' : ''
      }`}
    >
      <div>
        {/* Baris Atas: Ikon Dokumen/Domain, Info Utama, & Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded bg-surface-850 border border-surface-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              {item.url && !imgError ? (
                <img
                  src={getFaviconUrl(item.url)}
                  alt=""
                  className="w-4 h-4 rounded-sm object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <a
                href={item.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-surface-50 hover:text-sky-300 hover:underline transition-colors block line-clamp-2 leading-snug"
              >
                {item.title}
              </a>

              {domain && (
                <span className="text-xs font-mono text-surface-300 mt-0.5 block truncate">
                  {domain}
                </span>
              )}
            </div>
          </div>

          <CardMenu
            isPinned={!!item.isPinned}
            onEdit={onEdit}
            onTogglePin={onTogglePin}
            onDelete={onDelete}
          />
        </div>

        {/* Deskripsi (Jika ada) */}
        {item.description && (
          <p className="text-xs text-surface-200 mt-2.5 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      {/* Baris Bawah: Aksi Buka & Salin */}
      <div className="pt-2.5 border-t border-surface-700/80 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleCopy}
          className="text-surface-300 hover:text-white transition-colors inline-flex items-center gap-1.5 py-1 px-2 rounded hover:bg-surface-800 border border-transparent hover:border-surface-600"
          title="Salin tautan ke clipboard"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
          </svg>
          <span className="font-medium">{copied ? 'Tersalin!' : 'Salin URL'}</span>
        </button>

        <button
          type="button"
          onClick={handleOpen}
          className="text-amber-400 hover:text-amber-300 font-bold bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 transition-colors inline-flex items-center gap-1.5 py-1 px-2.5 rounded shadow-xs"
        >
          <span>Buka Tautan</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </button>
      </div>
    </div>
  );
}
