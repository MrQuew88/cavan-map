'use client';

import type { Annotation, VisibilityState } from '@/lib/types';
import { AnnotationList } from './AnnotationList';
import { AnnotationForm } from './AnnotationForm';

interface SidebarProps {
  annotations: Annotation[];
  visibility: VisibilityState;
  onVisibilityChange: (visibility: VisibilityState) => void;
  onAnnotationSelect: (annotation: Annotation) => void;
  selectedAnnotation: Annotation | null;
  editingAnnotation: Annotation | null;
  onSave: (annotation: Annotation) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
  formMode: 'create' | 'edit' | null;
}

export function Sidebar({
  annotations,
  visibility,
  onVisibilityChange,
  onAnnotationSelect,
  selectedAnnotation,
  editingAnnotation,
  onSave,
  onDelete,
  onCancelEdit,
  formMode,
}: SidebarProps) {
  return (
    <nav
      aria-label="Panneau d'annotations"
      className="flex h-full w-80 flex-col border-r border-[var(--border)] backdrop-blur-xl"
      style={{ background: 'rgba(10, 10, 22, 0.75)' }}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
          Annotations
        </h2>
        <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
          {annotations.length}
        </span>
      </div>

      {formMode && editingAnnotation ? (
        <div className="flex-1 overflow-y-auto">
          <AnnotationForm
            annotation={editingAnnotation}
            mode={formMode}
            onSave={onSave}
            onCancel={onCancelEdit}
            onDelete={
              formMode === 'edit'
                ? () => onDelete(editingAnnotation.id)
                : undefined
            }
          />
        </div>
      ) : (
        <AnnotationList
          annotations={annotations}
          visibility={visibility}
          onVisibilityChange={onVisibilityChange}
          onAnnotationSelect={onAnnotationSelect}
          selectedId={selectedAnnotation?.id ?? null}
        />
      )}
    </nav>
  );
}
