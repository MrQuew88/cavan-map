'use client';

import { useState, useEffect } from 'react';
import type { Annotation, AnnotationType, VisibilityState } from '@/lib/types';
import {
  ANNOTATION_LABELS,
  ANNOTATION_COLORS,
  DEFAULT_VISIBILITY,
  SEASON_LABELS,
  PRIORITY_LABELS,
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
    <div className="hide-scrollbar flex-1 overflow-y-auto">
      {TYPES.map((type) => {
        const items = annotations.filter((a) => a.type === type);
        const isCollapsed = collapsed[type];

        return (
          <div key={type} className="border-b border-white/4">
            <button
              onClick={() => toggleCollapsed(type)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-white/4"
            >
              <div
                className="h-2 w-2 rounded-full ring-2 ring-white/10"
                style={{ backgroundColor: ANNOTATION_COLORS[type] }}
              />
              <span className="flex-1 text-[13px] font-medium text-white/70">
                {ANNOTATION_LABELS[type]}
              </span>
              <span className="min-w-[20px] text-center font-mono text-[11px] text-white/30">
                {items.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(type);
                }}
                className="ml-0.5 rounded-md p-1 text-white/30 transition-colors duration-150 hover:bg-white/8 hover:text-white/60"
                title={visibility[type] ? 'Masquer' : 'Afficher'}
              >
                {visibility[type] ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
              <svg
                className={`h-3.5 w-3.5 text-white/20 transition-transform duration-200 ease-out ${isCollapsed ? '' : 'rotate-180'}`}
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
                    className={`flex w-full items-center gap-2 px-6 py-1.5 text-left transition-colors duration-150 hover:bg-white/4 ${
                      selectedId === ann.id ? 'bg-white/8' : ''
                    }`}
                  >
                    <span className="font-mono text-[11px] font-semibold text-white/60">
                      {ann.label}
                    </span>
                    <span className="flex-1 truncate text-[11px] text-white/35">
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
      return [ann.species, ann.technique, PRIORITY_LABELS[ann.priority]].filter(Boolean).join(' · ');
    case 'depth_point':
      return `${ann.depth}${ann.unit}`;
    case 'isobath':
      return `${ann.depth}${ann.unit}`;
    case 'dropoff':
      return `${ann.shallowDepth}→${ann.deepDepth}${ann.unit}`;
    case 'spawn_zone':
      return [ann.species, SEASON_LABELS[ann.season]].filter(Boolean).join(' · ');
    case 'accumulation_zone':
      return [ann.foodType, SEASON_LABELS[ann.season]].filter(Boolean).join(' · ');
    case 'note':
      return ann.notes?.slice(0, 40) || '';
  }
}
