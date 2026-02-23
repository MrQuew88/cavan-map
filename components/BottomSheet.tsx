'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Annotation, VisibilityState, Spot } from '@/lib/types';
import { AnnotationList } from './AnnotationList';
import { AnnotationForm } from './AnnotationForm';
import mapboxgl from 'mapbox-gl';

type SheetState = 'collapsed' | 'half' | 'full';

interface BottomSheetProps {
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
  onDeleteSpot: (id: string) => void;
  onUpdateSpot: (id: string, updates: Partial<Spot>) => void;
  formMode: 'create' | 'edit' | null;
}

export function BottomSheet({
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
  onDeleteSpot,
  onUpdateSpot,
  formMode,
}: BottomSheetProps) {
  const [state, setState] = useState<SheetState>('collapsed');
  const startY = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    if (formMode) setState('half');
  }, [formMode]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaY = startY.current - e.changedTouches[0].clientY;
    const elapsed = Date.now() - startTime.current;
    const velocity = Math.abs(deltaY) / elapsed;

    const useVelocity = velocity > 0.11;
    const threshold = useVelocity ? 20 : 50;

    if (deltaY > threshold) {
      setState((s) => (s === 'collapsed' ? 'half' : s === 'half' ? 'full' : 'full'));
    } else if (deltaY < -threshold) {
      setState((s) => (s === 'full' ? 'half' : s === 'half' ? 'collapsed' : 'collapsed'));
    }
  }, []);

  const heightClass = {
    collapsed: 'h-12',
    half: 'h-[50dvh]',
    full: 'h-[85dvh]',
  }[state];

  return (
    <div
      role="region"
      aria-label="Panneau d'annotations"
      className={`fixed inset-x-0 bottom-0 z-40 rounded-t-2xl shadow-2xl shadow-black/40 ring-1 ring-[var(--border)] backdrop-blur-xl ${heightClass}`}
      style={{
        transition: 'height 500ms cubic-bezier(0.32, 0.72, 0, 1)',
        willChange: 'height',
        background: 'rgba(34, 31, 25, 0.85)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={() => setState((s) => (s === 'collapsed' ? 'half' : 'collapsed'))}
        className="flex w-full items-center justify-center py-2.5"
        aria-label={state === 'collapsed' ? 'Ouvrir le panneau' : 'Fermer le panneau'}
        aria-expanded={state !== 'collapsed'}
      >
        <div className="h-1 w-9 rounded-full" style={{ backgroundColor: 'rgba(212, 145, 92, 0.4)' }} />
      </button>

      {state !== 'collapsed' && (
        <div className="flex h-[calc(100%-2.5rem)] flex-col overflow-hidden">
          {formMode && editingAnnotation ? (
            <div className="flex-1 overflow-y-auto">
              <AnnotationForm
                annotation={editingAnnotation}
                mode={formMode}
                spots={spots}
                onSave={onSave}
                onCancel={() => {
                  onCancelEdit();
                  setState('collapsed');
                }}
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
              onAnnotationSelect={(ann) => {
                onAnnotationSelect(ann);
                setState('collapsed');
              }}
              onDeleteSpot={onDeleteSpot}
              onUpdateSpot={onUpdateSpot}
              selectedId={selectedAnnotation?.id ?? null}
            />
          )}
        </div>
      )}
    </div>
  );
}
