// src/pages/LoginPage.tsx — Gerbang Akses Kode Kelompok KKN (Clean & Trustworthy Gate)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, ApiError } from '../lib/api';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      navigate('/', { replace: true });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Koneksi terputus. Pastikan perangkat Anda terhubung ke internet.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) {
      setError('Kode akses wajib diisi');
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header & Identitas */}
        <div className="mb-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
            <h1 className="text-xl font-bold text-surface-50 tracking-tight">
              KKN Hub
            </h1>
            <span className="text-[11px] font-mono text-surface-400 px-1.5 py-0.5 rounded bg-surface-850 border border-surface-800">
              Desa Adat Bali
            </span>
          </div>
          <p className="text-xs text-surface-400 leading-relaxed">
            Portal berkas, rundown kegiatan posko, dan akun kelompok bersama.
          </p>
        </div>

        {/* Kotak Form Masuk */}
        <div className="kkn-panel p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="access-code"
                className="block text-xs font-semibold text-surface-300 mb-1.5"
              >
                Kode Akses Kelompok
              </label>

              <div className="relative">
                <input
                  id="access-code"
                  type={showPassword ? 'text' : 'password'}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError('');
                  }}
                  className="input-field text-center font-mono text-base py-2.5 px-9 tracking-widest"
                  placeholder="••••••••"
                  autoFocus
                  autoComplete="off"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white p-1 rounded transition-colors"
                  aria-label={showPassword ? 'Sembunyikan kode' : 'Lihat kode'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {error && (
                <p className="text-rose-400 text-xs mt-1.5 leading-snug">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full py-2.5 text-sm"
            >
              {loginMutation.isPending ? 'Memeriksa...' : 'Buka Portal'}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-surface-800 text-[11px] text-surface-400 text-center leading-relaxed">
            Kode akses dibagikan oleh Koordinator Posko atau Sekretaris Kelompok.
          </div>
        </div>
      </div>
    </div>
  );
}
