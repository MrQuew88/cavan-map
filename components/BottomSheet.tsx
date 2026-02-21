'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Annotation, VisibilityState } from '@/lib/types';
import { AnnotationList } from './AnnotationList';
import { AnnotationForm } from './AnnotationForm';

type SheetState = 'collapsed' | 'half' | 'full';

interface BottomSheetProps {
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

export function BottomSheet({
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
}: BottomSheetProps) {
  const [state, setState] = useState<SheetState>('collapsed');
  const startY = useRef(0);
  const currentState = useRef<SheetState>(state);

  useEffect(() => {
    currentState.current = state;
  }, [state]);

  // Open when editing
  useEffect(() => {
    if (formMode) setState('half');
  }, [formMode]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaY = startY.current - e.changedTouches[0].clientY;
    const threshold = 50;

    if (deltaY > threshold) {
      // Swipe up
      setState((s) => (s === 'collapsed' ? 'half' : s === 'half' ? 'full' : 'full'));
    } else if (deltaY < -threshold) {
      // Swipe down
      setState((s) => (s === 'full' ? 'half' : s === 'half' ? 'collapsed' : 'collapsed'));
    }
  }, []);

  const heightClass = {
    collapsed: 'h-12',
    half: 'h-[50vh]',
    full: 'h-[85vh]',
  }[state];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl border-t border-white/10 bg-[#0f0f1a] transition-[height] duration-300 ease-out ${heightClass}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Handle */}
      <button
        onClick={() =>
          setState((s) => (s === 'collapsed' ? 'half' : 'collapsed'))
        }
        className="flex w-full items-center justify-center py-2"
      >
        <div className="h-1 w-10 rounded-full bg-white/30" />
      </button>

      {state !== 'collapsed' && (
        <div className="flex h-[calc(100%-2rem)] flex-col overflow-hidden">
          {formMode && editingAnnotation ? (
            <div className="flex-1 overflow-y-auto">
              <AnnotationForm
                annotation={editingAnnotation}
                mode={formMode}
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
              visibility={visibility}
              onVisibilityChange={onVisibilityChange}
              onAnnotationSelect={(ann) => {
                onAnnotationSelect(ann);
                setState('collapsed');
              }}
              selectedId={selectedAnnotation?.id ?? null}
            />
          )}
        </div>
      )}
    </div>
  );
}
