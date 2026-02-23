'use client';

import type { Annotation, VisibilityState, Spot } from '@/lib/types';
import { AnnotationList } from './AnnotationList';
import { AnnotationForm } from './AnnotationForm';
import mapboxgl from 'mapbox-gl';

interface SidebarProps {
  annotations: Annotation[];
  spots: Spot[];
  map: mapboxgl.Map | null;
  visibility: VisibilityState;
  onVisibilityChange: (visibility: VisibilityState) => void;
  onAnnotationSelect: (annotation: Annotation) => void;
  selectedAnnotation: Annotation | null;
  editingAnnotation: Annotation | null;
  onSave: (annotation: Annotation) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
  onCreateSpot: () => void;
  onDeleteSpot: (id: string) => void;
  onUpdateSpot: (id: string, updates: Partial<Spot>) => void;
  formMode: 'create' | 'edit' | null;
}

export function Sidebar({
  annotations,
  spots,
  map,
  visibility,
  onVisibilityChange,
  onAnnotationSelect,
  selectedAnnotation,
  editingAnnotation,
  onSave,
  onDelete,
  onCancelEdit,
  onCreateSpot,
  onDeleteSpot,
  onUpdateSpot,
  formMode,
}: SidebarProps) {
  return (
    <nav
      aria-label="Panneau d'annotations"
      className="flex h-full w-80 flex-col border-r border-[var(--border)] backdrop-blur-xl"
      style={{ background: 'rgba(34, 31, 25, 0.85)' }}
    >
      <div className="paper-grain relative flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
          Annotations
        </h2>
        <span className="font-mono text-sm text-[var(--text-tertiary)]">
          {annotations.length}
        </span>
      </div>

      {formMode && editingAnnotation ? (
        <div className="flex-1 overflow-y-auto">
          <AnnotationForm
            annotation={editingAnnotation}
            mode={formMode}
            spots={spots}
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
          spots={spots}
          map={map}
          visibility={visibility}
          onVisibilityChange={onVisibilityChange}
          onAnnotationSelect={onAnnotationSelect}
          onCreateSpot={onCreateSpot}
          onDeleteSpot={onDeleteSpot}
          onUpdateSpot={onUpdateSpot}
          selectedId={selectedAnnotation?.id ?? null}
        />
      )}
    </nav>
  );
}
