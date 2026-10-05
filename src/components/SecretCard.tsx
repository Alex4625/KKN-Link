// src/components/SecretCard.tsx — Akun Bersama & Kredensial Terenkripsi (Clean Security Vault)
import { useState, useEffect, useRef } from 'react';
import { useToast } from './Toast';
import CardMenu from './CardMenu';
import { itemsApi, type ItemBase, type SecretData } from '../lib/api';

interface SecretCardProps {
  item: ItemBase;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

export default function SecretCard({ item, onEdit, onTogglePin, onDelete }: SecretCardProps) {
  const { showToast } = useToast();
  const [revealed, setRevealed] = useState(false);
  const [secretData, setSecretData] = useState<SecretData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<'user' | 'pass' | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (revealed) {
      timerRef.current = setTimeout(() => {
        setRevealed(false);
        setSecretData(null);
      }, 30_000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [revealed]);

  const handleReveal = async () => {
    if (revealed) {
      setRevealed(false);
      setSecretData(null);
      return;
    }

    setLoading(true);
    try {
      const res = await itemsApi.reveal(item.id);
      setSecretData(res.data);
      setRevealed(true);
    } catch (error: any) {
      showToast(error.message || 'Gagal membuka rahasia', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string, key: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`${label} disalin`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div
      className={`kkn-card p-4 sm:p-4.5 flex flex-col justify-between gap-3 ${
        item.isPinned ? 'kkn-card-pinned' : ''
      }`}
    >
      <div>
        {/* Baris Atas: Judul Kredensial & Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded bg-surface-850 border border-surface-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-bali-emerald">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-surface-100 leading-snug">
                {item.title}
              </h3>
              <span className="text-[11px] text-surface-400 block mt-0.5">
                {revealed ? 'Kredensial aktif (auto-lock 30s)' : 'Tersimpan aman & terenkripsi'}
              </span>
            </div>
          </div>

          <CardMenu
            isPinned={!!item.isPinned}
            onEdit={onEdit}
            onTogglePin={onTogglePin}
            onDelete={onDelete}
          />
        </div>

        {/* Kotak Konten Rahasia */}
        <div className="mt-3 pt-2.5 border-t border-surface-850">
          {!revealed ? (
            <div className="bg-surface-950 border border-surface-700 rounded p-2.5 flex items-center justify-between">
              <span className="font-mono text-sm text-surface-400 tracking-widest pl-1">
                ••••••••••••••
              </span>
              <button
                type="button"
                onClick={handleReveal}
                disabled={loading}
                className="text-xs text-emerald-300 hover:text-white font-bold px-3 py-1.5 rounded bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 transition-colors shadow-xs"
              >
                {loading ? 'Membuka...' : 'Buka Sandi'}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 bg-surface-950 border border-surface-700 rounded p-3 text-xs">
              {/* Username */}
              {secretData?.username && (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] uppercase font-mono text-surface-300 font-semibold block">Username / Email</span>
                    <span className="font-mono text-surface-50 font-medium truncate block text-xs mt-0.5">{secretData.username}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(secretData.username, 'Username', 'user')}
                    className="text-surface-300 hover:text-white p-1.5 rounded bg-surface-800 hover:bg-surface-700 border border-surface-700 transition-colors"
                    title="Salin username"
                  >
                    {copiedKey === 'user' ? (
                      <span className="text-emerald-400 font-bold text-[11px]">Tersalin!</span>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* Password */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-800">
                <div className="min-w-0">
                  <span className="text-[11px] uppercase font-mono text-surface-300 font-semibold block">Password</span>
                  <span className="font-mono text-emerald-300 font-bold truncate block text-sm mt-0.5">
                    {secretData?.password || '••••••••'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => secretData?.password && handleCopy(secretData.password, 'Password', 'pass')}
                  className="text-surface-300 hover:text-white p-1.5 rounded bg-surface-800 hover:bg-surface-700 border border-surface-700 transition-colors"
                  title="Salin password"
                >
                  {copiedKey === 'pass' ? (
                    <span className="text-emerald-400 font-bold text-[11px]">Tersalin!</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                      </svg>
                    )}
                  </button>
              </div>

              {/* Progress timer */}
              <div className="w-full bg-surface-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-400 h-full"
                  style={{ animation: 'shrinkTimer 30s linear forwards' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Baris Bawah: Aksi Kunci Kembali (Bila Terbuka) */}
      {revealed && (
        <div className="pt-2 border-t border-surface-700/80 flex items-center justify-between text-xs text-surface-300">
          <span className="text-[11px] text-surface-300 font-medium">Tutup otomatis dlm 30s</span>
          <button
            type="button"
            onClick={() => {
              setRevealed(false);
              setSecretData(null);
            }}
            className="text-amber-400 hover:text-amber-300 font-bold py-0.5 px-2 rounded hover:bg-surface-800 border border-transparent hover:border-surface-700"
          >
            Kunci Sekarang
          </button>
        </div>
      )}
    </div>
  );
}
