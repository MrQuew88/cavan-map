'use client';

import { useState, useEffect } from 'react';
import type { Annotation, AnnotationType, VisibilityState } from '@/lib/types';
import { ANNOTATION_LABELS, ANNOTATION_COLORS, DEFAULT_VISIBILITY } from '@/lib/constants';

interface AnnotationListProps {
  annotations: Annotation[];
  visibility: VisibilityState;
  onVisibilityChange: (visibility: VisibilityState) => void;
  onAnnotationSelect: (annotation: Annotation) => void;
  selectedId: string | null;
}

const TYPES: AnnotationType[] = [
  'target_zone',
  'depth_point',
  'isobath',
  'dropoff',
  'spawn_zone',
  'accumulation_zone',
  'note',
];

export function AnnotationList({
  annotations,
  visibility,
  onVisibilityChange,
  onAnnotationSelect,
  selectedId,
}: AnnotationListProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Load visibility from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('annotation-visibility');
      if (saved) {
        onVisibilityChange({ ...DEFAULT_VISIBILITY, ...JSON.parse(saved) });
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleVisibility = (type: AnnotationType) => {
    const newVis = { ...visibility, [type]: !visibility[type] };
    onVisibilityChange(newVis);
    try {
      localStorage.setItem('annotation-visibility', JSON.stringify(newVis));
    } catch {}
  };

  const toggleCollapsed = (type: string) => {
    setCollapsed((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="hide-scrollbar flex-1 overflow-y-auto">
      {TYPES.map((type) => {
        const items = annotations.filter((a) => a.type === type);
        const isCollapsed = collapsed[type];

        return (
          <div key={type} className="border-b border-white/5">
            <button
              onClick={() => toggleCollapsed(type)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-white/5"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: ANNOTATION_COLORS[type] }}
              />
              <span className="flex-1 text-sm font-medium text-white/80">
                {ANNOTATION_LABELS[type]}
              </span>
              <span className="text-xs text-white/40">{items.length}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(type);
                }}
                className="ml-1 p-1 text-white/40 hover:text-white/70"
                title={visibility[type] ? 'Hide' : 'Show'}
              >
                {visibility[type] ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
              <svg
                className={`h-4 w-4 text-white/30 transition ${isCollapsed ? '' : 'rotate-180'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {!isCollapsed && items.length > 0 && (
              <div className="pb-1">
                {items.map((ann) => (
                  <button
                    key={ann.id}
                    onClick={() => onAnnotationSelect(ann)}
                    className={`flex w-full items-center gap-2 px-6 py-1.5 text-left text-sm transition hover:bg-white/5 ${
                      selectedId === ann.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <span className="font-mono text-xs font-bold text-white/70">
                      {ann.label}
                    </span>
                    <span className="flex-1 truncate text-xs text-white/50">
                      {getAnnotationSummary(ann)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getAnnotationSummary(ann: Annotation): string {
  switch (ann.type) {
    case 'target_zone':
      return [ann.species, ann.technique, ann.priority].filter(Boolean).join(' · ');
    case 'depth_point':
      return `${ann.depth}${ann.unit}`;
    case 'isobath':
      return `${ann.depth}${ann.unit}`;
    case 'dropoff':
      return `${ann.shallowDepth}→${ann.deepDepth}${ann.unit}`;
    case 'spawn_zone':
      return [ann.species, ann.season].filter(Boolean).join(' · ');
    case 'accumulation_zone':
      return [ann.foodType, ann.season].filter(Boolean).join(' · ');
    case 'note':
      return ann.notes?.slice(0, 40) || '';
  }
}
