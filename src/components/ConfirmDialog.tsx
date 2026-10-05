// src/components/ConfirmDialog.tsx — Dialog Konfirmasi Tindakan (Clean & Direct)
import { useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Hapus',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs"
        onClick={onCancel}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-surface-900 border border-surface-700 rounded-lg p-5 shadow-2xl z-10 animate-sheet">
        <h3 className="text-base font-bold text-surface-100 mb-2">
          {title}
        </h3>

        <p className="text-xs text-surface-200 leading-relaxed mb-5">
          {message}
        </p>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-danger"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
