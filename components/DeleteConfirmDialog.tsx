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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
        <h3 className="mb-2 text-lg font-semibold text-white">Delete annotation</h3>
        <p className="mb-6 text-sm text-white/60">
          Are you sure you want to delete <strong className="text-white">{label}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
