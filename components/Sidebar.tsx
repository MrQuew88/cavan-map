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
    <div className="flex h-full w-80 flex-col border-r border-white/10 bg-[#0f0f1a]">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white/80">Annotations</h2>
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
    </div>
  );
}
