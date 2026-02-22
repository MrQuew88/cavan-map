'use client';

import { useState, useEffect } from 'react';
import type { Annotation, AnnotationType, VisibilityState } from '@/lib/types';
import {
  ANNOTATION_LABELS,
  ANNOTATION_COLORS,
  DEFAULT_VISIBILITY,
  SEASON_LABELS,
  CONFIDENCE_LABELS,
} from '@/lib/constants';

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
    <div className="hide-scrollbar flex-1 overflow-y-auto" role="list" aria-label="Liste des annotations">
      {TYPES.map((type) => {
        const items = annotations.filter((a) => a.type === type);
        const isCollapsed = collapsed[type];
        const isVisible = visibility[type];

        return (
          <div key={type} className="border-b border-[var(--border)]" role="listitem">
            <div className="flex w-full items-center gap-2 px-4 py-2.5">
              <button
                onClick={() => toggleCollapsed(type)}
                aria-expanded={!isCollapsed}
                aria-label={`${ANNOTATION_LABELS[type]} — ${isCollapsed ? 'développer' : 'réduire'}`}
                className="flex flex-1 items-center gap-2.5 text-left transition-colors duration-150 hover:opacity-80"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: ANNOTATION_COLORS[type],
                    opacity: isVisible ? 1 : 0.3,
                    boxShadow: isVisible ? `0 0 6px ${ANNOTATION_COLORS[type]}40` : 'none',
                  }}
                />
                <span className={`flex-1 text-[13px] font-medium transition-colors duration-150 ${isVisible ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                  {ANNOTATION_LABELS[type]}
                </span>
                <span className="min-w-[18px] text-center font-mono text-[10px] text-[var(--text-tertiary)]">
                  {items.length}
                </span>
                <svg
                  className={`h-3 w-3 text-[var(--text-tertiary)] transition-transform duration-200`}
                  style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <button
                onClick={() => toggleVisibility(type)}
                className="rounded-md p-1.5 text-[var(--text-tertiary)] transition-colors duration-150 hover:bg-white/6 hover:text-[var(--text-secondary)]"
                aria-label={isVisible ? `Masquer ${ANNOTATION_LABELS[type]}` : `Afficher ${ANNOTATION_LABELS[type]}`}
                aria-pressed={isVisible}
              >
                {isVisible ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>

            {!isCollapsed && items.length > 0 && (
              <div className="pb-1">
                {items.map((ann) => (
                  <button
                    key={ann.id}
                    onClick={() => onAnnotationSelect(ann)}
                    aria-label={`${ANNOTATION_LABELS[ann.type]} ${ann.label}`}
                    className={`flex w-full items-center gap-2.5 px-4 py-1.5 pl-9 text-left transition-all duration-150 hover:bg-[var(--accent-muted)] ${
                      selectedId === ann.id
                        ? 'bg-[var(--accent-muted)] text-[var(--text-primary)]'
                        : ''
                    }`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  >
                    <span className="font-mono text-[11px] font-semibold text-[var(--accent)]">
                      {ann.label}
                    </span>
                    <span className="flex-1 truncate text-[11px] text-[var(--text-tertiary)]">
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
      return [ann.title, ann.depth ? `${ann.depth}m` : ''].filter(Boolean).join(' · ');
    case 'depth_point':
      return `${ann.depth}m`;
    case 'isobath':
      return `${ann.depth}m`;
    case 'dropoff':
      return `${ann.shallowDepth}→${ann.deepDepth}m`;
    case 'spawn_zone':
      return [ann.species, SEASON_LABELS[ann.season]].filter(Boolean).join(' · ');
    case 'accumulation_zone':
      return [ann.foodType, SEASON_LABELS[ann.season]].filter(Boolean).join(' · ');
    case 'note':
      return ann.notes?.slice(0, 40) || '';
  }
}
