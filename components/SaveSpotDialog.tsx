'use client';

import { useEffect, useRef } from 'react';

interface SaveSpotDialogProps {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SaveSpotDialog({
  open,
  name,
  onConfirm,
  onCancel,
}: SaveSpotDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    confirmRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-spot-dialog-title"
      aria-describedby="save-spot-dialog-desc"
    >
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onCancel}
        style={{
          background: 'rgba(26, 23, 18, 0.7)',
          animation: 'dialog-overlay 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      <div
        ref={dialogRef}
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl ring-1 ring-[var(--border)] backdrop-blur-xl"
        style={{
          background: 'rgba(44, 40, 32, 0.92)',
          animation: 'dialog-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="absolute inset-x-6 top-0 h-px" style={{ backgroundColor: 'rgba(205, 180, 140, 0.1)' }} />

        <h3 id="save-spot-dialog-title" className="mb-2 text-[15px] font-semibold text-[var(--text-primary)]">
          Enregistrer comme spot
        </h3>
        <p id="save-spot-dialog-desc" className="mb-6 text-[13px] leading-relaxed text-[var(--text-secondary)]">
          Enregistrer <strong className="font-semibold text-[var(--text-primary)]">{name}</strong> comme nouveau spot ?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="btn-press rounded-xl px-4 py-2.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors duration-150"
            style={{ backgroundColor: 'rgba(205, 180, 140, 0.06)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(205, 180, 140, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(205, 180, 140, 0.06)')}
          >
            Annuler
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="btn-press rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors duration-150"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
