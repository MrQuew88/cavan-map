'use client';

import type { Annotation } from '@/lib/types';
import {
  ANNOTATION_LABELS,
  ANNOTATION_COLORS,
} from '@/lib/constants';

interface AnnotationPopupProps {
  annotation: Annotation;
  onEdit: () => void;
  onClose: () => void;
}

export function AnnotationPopup({ annotation, onEdit, onClose }: AnnotationPopupProps) {
  const accentColor = ANNOTATION_COLORS[annotation.type];

  return (
    <div className="min-w-[200px] p-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}50` }}
          aria-hidden="true"
        />
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          {ANNOTATION_LABELS[annotation.type]}
        </span>
        <span className="ml-auto font-mono text-sm font-semibold text-[var(--text-primary)]">
          {annotation.label}
        </span>
      </div>

      {renderDetails(annotation)}

      {annotation.notes && (
        <p className="mt-2.5 border-t border-[var(--border)] pt-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
          {annotation.notes}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={onEdit}
          className="btn-press flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
        >
          Modifier
        </button>
        <button
          onClick={onClose}
          className="btn-press rounded-lg bg-white/6 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:bg-white/10"
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
        <div className="flex flex-wrap gap-1.5">
          {annotation.title && <Tag>{annotation.title}</Tag>}
          {annotation.depth > 0 && <Tag>{annotation.depth}m</Tag>}
        </div>
      );
    case 'depth_point':
      return <div className="font-mono text-sm font-medium text-blue-300">{annotation.depth}m</div>;
    case 'isobath':
      return <div className="font-mono text-sm font-medium text-teal-300">{annotation.depth}m</div>;
    case 'dropoff':
      return (
        <div className="font-mono text-sm font-medium text-red-300">
          {annotation.shallowDepth}m → {annotation.deepDepth}m
        </div>
      );
    case 'spawn_zone':
      return (
        <div className="flex flex-wrap gap-1.5">
          {annotation.title && <Tag>{annotation.title}</Tag>}
          {annotation.depth > 0 && <Tag>{annotation.depth}m</Tag>}
          {annotation.substrate && <Tag>{annotation.substrate}</Tag>}
        </div>
      );
    case 'accumulation_zone':
      return (
        <div className="flex flex-wrap gap-1.5">
          {annotation.title && <Tag>{annotation.title}</Tag>}
          {annotation.description && <Tag>{annotation.description}</Tag>}
          {annotation.activationConditions && <Tag>{annotation.activationConditions}</Tag>}
        </div>
      );
    case 'note':
      return null;
  }
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-white/6 px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
      {children}
    </span>
  );
}
