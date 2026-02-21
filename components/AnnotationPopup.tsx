'use client';

import type { Annotation } from '@/lib/types';
import { ANNOTATION_LABELS, ANNOTATION_COLORS } from '@/lib/constants';

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
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: ANNOTATION_COLORS[annotation.type] }}
        />
        <span className="text-xs font-medium text-white/50">
          {ANNOTATION_LABELS[annotation.type]}
        </span>
        <span className="ml-auto text-sm font-bold text-white">
          {annotation.label}
        </span>
      </div>

      {renderDetails(annotation)}

      {annotation.notes && (
        <p className="mt-2 border-t border-white/10 pt-2 text-xs text-white/70">
          {annotation.notes}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
        >
          Edit
        </button>
        <button
          onClick={onClose}
          className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/20"
        >
          Close
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
          <Tag>{annotation.priority}</Tag>
          <Tag>{annotation.season}</Tag>
          {annotation.species && <Tag>{annotation.species}</Tag>}
          {annotation.technique && <Tag>{annotation.technique}</Tag>}
        </div>
      );
    case 'depth_point':
      return <div className="text-sm font-mono text-blue-300">{annotation.depth}{annotation.unit}</div>;
    case 'isobath':
      return <div className="text-sm font-mono text-teal-300">{annotation.depth}{annotation.unit}</div>;
    case 'dropoff':
      return (
        <div className="text-sm font-mono text-red-300">
          {annotation.shallowDepth}{annotation.unit} → {annotation.deepDepth}{annotation.unit}
        </div>
      );
    case 'spawn_zone':
      return (
        <div className="flex flex-wrap gap-1.5 text-xs">
          {annotation.species && <Tag>{annotation.species}</Tag>}
          <Tag>{annotation.season}</Tag>
          <Tag>{annotation.confidence}</Tag>
        </div>
      );
    case 'accumulation_zone':
      return (
        <div className="flex flex-wrap gap-1.5 text-xs">
          {annotation.foodType && <Tag>{annotation.foodType}</Tag>}
          <Tag>{annotation.season}</Tag>
          <Tag>{annotation.confidence}</Tag>
        </div>
      );
    case 'note':
      return null;
  }
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-white/10 px-2 py-0.5 text-white/70">
      {children}
    </span>
  );
}
