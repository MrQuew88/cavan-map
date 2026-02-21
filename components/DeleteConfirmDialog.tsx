'use client';

interface DeleteConfirmDialogProps {
  open: boolean;
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  label,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-2xl border border-white/8 bg-[var(--panel-raised)] p-6 shadow-2xl"
        style={{ animation: 'fadeScale 0.2s ease-out' }}
      >
        <h3 className="mb-2 text-base font-semibold text-white">
          Supprimer l'annotation
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-white/50">
          Voulez-vous vraiment supprimer <strong className="text-white">{label}</strong> ?
          Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="btn-press rounded-lg bg-white/8 px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-150 hover:bg-white/14"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="btn-press rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-500"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
