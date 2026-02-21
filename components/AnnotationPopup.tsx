'use client';

import type { Annotation } from '@/lib/types';
import {
  ANNOTATION_LABELS,
  ANNOTATION_COLORS,
  SEASON_LABELS,
  PRIORITY_LABELS,
  CONFIDENCE_LABELS,
} from '@/lib/constants';

interface AnnotationPopupProps {
  annotation: Annotation;
  onEdit: () => void;
  onClose: () => void;
}

export function AnnotationPopup({ annotation, onEdit, onClose }: AnnotationPopupProps) {
  return (
    <div className="min-w-[200px] p-3">
      <div className="mb-2 flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
          style={{ backgroundColor: ANNOTATION_COLORS[annotation.type] }}
        />
        <span className="text-[11px] font-medium text-white/45">
          {ANNOTATION_LABELS[annotation.type]}
        </span>
        <span className="ml-auto font-mono text-sm font-semibold text-white">
          {annotation.label}
        </span>
      </div>

      {renderDetails(annotation)}

      {annotation.notes && (
        <p className="mt-2 border-t border-white/8 pt-2 text-xs leading-relaxed text-white/60">
          {annotation.notes}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={onEdit}
          className="btn-press flex-1 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[var(--accent-hover)]"
        >
          Modifier
        </button>
        <button
          onClick={onClose}
          className="btn-press rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors duration-150 hover:bg-white/14"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

function renderDetails(annotation: Annotation) {
  switch (annotation.type) {
    case 'target_zone':
      return (
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Tag>{PRIORITY_LABELS[annotation.priority]}</Tag>
          <Tag>{SEASON_LABELS[annotation.season]}</Tag>
          {annotation.species && <Tag>{annotation.species}</Tag>}
          {annotation.technique && <Tag>{annotation.technique}</Tag>}
        </div>
      );
    case 'depth_point':
      return <div className="font-mono text-sm text-blue-300">{annotation.depth}{annotation.unit}</div>;
    case 'isobath':
      return <div className="font-mono text-sm text-teal-300">{annotation.depth}{annotation.unit}</div>;
    case 'dropoff':
      return (
        <div className="font-mono text-sm text-red-300">
          {annotation.shallowDepth}{annotation.unit} → {annotation.deepDepth}{annotation.unit}
        </div>
      );
    case 'spawn_zone':
      return (
        <div className="flex flex-wrap gap-1.5 text-xs">
          {annotation.species && <Tag>{annotation.species}</Tag>}
          <Tag>{SEASON_LABELS[annotation.season]}</Tag>
          <Tag>{CONFIDENCE_LABELS[annotation.confidence]}</Tag>
        </div>
      );
    case 'accumulation_zone':
      return (
        <div className="flex flex-wrap gap-1.5 text-xs">
          {annotation.foodType && <Tag>{annotation.foodType}</Tag>}
          <Tag>{SEASON_LABELS[annotation.season]}</Tag>
          <Tag>{CONFIDENCE_LABELS[annotation.confidence]}</Tag>
        </div>
      );
    case 'note':
      return null;
  }
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-white/8 px-2 py-0.5 text-[11px] text-white/60">
      {children}
    </span>
  );
}
