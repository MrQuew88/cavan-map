'use client';

import { useState, useEffect, useRef } from 'react';
import type { Annotation, AnnotationType, VisibilityState, Spot } from '@/lib/types';
import {
  ANNOTATION_LABELS,
  ANNOTATION_COLORS,
  DEFAULT_VISIBILITY,
  SEASON_LABELS,
} from '@/lib/constants';
import mapboxgl from 'mapbox-gl';

interface AnnotationListProps {
  annotations: Annotation[];
  spots: Spot[];
  map: mapboxgl.Map | null;
  visibility: VisibilityState;
  onVisibilityChange: (visibility: VisibilityState) => void;
  onAnnotationSelect: (annotation: Annotation) => void;
  onCreateSpot: () => void;
  onDeleteSpot: (id: string) => void;
  onUpdateSpot: (id: string, updates: Partial<Spot>) => void;
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
  spots,
  map,
  visibility,
  onVisibilityChange,
  onAnnotationSelect,
  onCreateSpot,
  onDeleteSpot,
  onUpdateSpot,
  selectedId,
}: AnnotationListProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('annotation-visibility');
      if (saved) {
        onVisibilityChange({ ...DEFAULT_VISIBILITY, ...JSON.parse(saved) });
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingSpotId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingSpotId]);

  const toggleVisibility = (type: AnnotationType) => {
    const newVis = { ...visibility, [type]: !visibility[type] };
    onVisibilityChange(newVis);
    try {
      localStorage.setItem('annotation-visibility', JSON.stringify(newVis));
    } catch {}
  };

  const toggleCollapsed = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSpotClick = (spot: Spot) => {
    if (!map) return;
    map.flyTo({
      center: [spot.centerLng, spot.centerLat],
      zoom: spot.zoomLevel,
      duration: 1000,
    });
  };

  const startEditSpot = (spot: Spot, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSpotId(spot.id);
    setEditingName(spot.name);
  };

  const commitEditSpot = (spotId: string) => {
    const trimmed = editingName.trim();
    if (trimmed) {
      onUpdateSpot(spotId, { name: trimmed });
    }
    setEditingSpotId(null);
  };

  const unassignedAnnotations = annotations.filter((a) => !a.spotId);

  return (
    <div className="hide-scrollbar flex-1 overflow-y-auto" role="list" aria-label="Liste des annotations">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
          Spots
        </span>
        <button
          onClick={onCreateSpot}
          className="flex h-5 w-5 items-center justify-center rounded-md text-[var(--text-tertiary)] transition-colors duration-150 hover:bg-white/6 hover:text-[var(--accent)]"
          aria-label="Créer un spot"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Spots */}
      {spots.map((spot) => {
        const spotAnnotations = annotations.filter((a) => a.spotId === spot.id);
        const spotKey = `spot:${spot.id}`;
        const isSpotCollapsed = collapsed[spotKey];

        return (
          <div key={spot.id} className="border-b border-[var(--border)]" role="listitem">
            {/* Spot header */}
            <div className="flex w-full items-center gap-2 px-4 py-2.5">
              <button
                onClick={() => {
                  toggleCollapsed(spotKey);
                  handleSpotClick(spot);
                }}
                className="flex flex-1 items-center gap-2.5 text-left transition-colors duration-150 hover:opacity-80"
                aria-expanded={!isSpotCollapsed}
                aria-label={`${spot.name} — ${isSpotCollapsed ? 'développer' : 'réduire'}`}
              >
                <svg className="h-3 w-3 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {editingSpotId === spot.id ? (
                  <input
                    ref={editInputRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => commitEditSpot(spot.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEditSpot(spot.id);
                      if (e.key === 'Escape') setEditingSpotId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent text-[13px] font-medium text-[var(--text-primary)] outline-none ring-1 ring-[var(--accent)]/30 rounded px-1"
                  />
                ) : (
                  <span className="flex-1 text-[13px] font-medium text-[var(--text-primary)]">
                    {spot.name}
                  </span>
                )}
                <span className="min-w-[18px] text-center font-mono text-[10px] text-[var(--text-tertiary)]">
                  {spotAnnotations.length}
                </span>
                <svg
                  className="h-3 w-3 text-[var(--text-tertiary)] transition-transform duration-200"
                  style={{ transform: isSpotCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {editingSpotId !== spot.id && (
                <>
                  <button
                    onClick={(e) => startEditSpot(spot, e)}
                    className="rounded-md p-1.5 text-[var(--text-tertiary)] transition-colors duration-150 hover:bg-white/6 hover:text-[var(--text-secondary)]"
                    aria-label={`Renommer ${spot.name}`}
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSpot(spot.id);
                    }}
                    className="rounded-md p-1.5 text-[var(--text-tertiary)] transition-colors duration-150 hover:bg-[var(--destructive-muted)] hover:text-[var(--destructive)]"
                    aria-label={`Supprimer ${spot.name}`}
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Spot annotations grouped by type */}
            {!isSpotCollapsed && (
              <div className="pb-1">
                {TYPES.map((type) => {
                  const items = spotAnnotations.filter((a) => a.type === type);
                  if (items.length === 0) return null;
                  const typeKey = `spot:${spot.id}:${type}`;
                  return (
                    <TypeGroup
                      key={typeKey}
                      type={type}
                      items={items}
                      isCollapsed={collapsed[typeKey]}
                      isVisible={visibility[type]}
                      onToggleCollapse={() => toggleCollapsed(typeKey)}
                      onToggleVisibility={() => toggleVisibility(type)}
                      onAnnotationSelect={onAnnotationSelect}
                      selectedId={selectedId}
                      indent
                    />
                  );
                })}
                {spotAnnotations.length === 0 && (
                  <div className="px-4 py-2 pl-9 text-[11px] italic text-[var(--text-tertiary)]">
                    Aucune annotation
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Non classé */}
      <div className="border-b border-[var(--border)]" role="listitem">
        <div className="flex w-full items-center gap-2 px-4 py-2.5">
          <button
            onClick={() => toggleCollapsed('unassigned')}
            className="flex flex-1 items-center gap-2.5 text-left transition-colors duration-150 hover:opacity-80"
            aria-expanded={!collapsed['unassigned']}
            aria-label={`Non classé — ${collapsed['unassigned'] ? 'développer' : 'réduire'}`}
          >
            <svg className="h-3 w-3 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="flex-1 text-[13px] font-medium text-[var(--text-secondary)]">
              Non classé
            </span>
            <span className="min-w-[18px] text-center font-mono text-[10px] text-[var(--text-tertiary)]">
              {unassignedAnnotations.length}
            </span>
            <svg
              className="h-3 w-3 text-[var(--text-tertiary)] transition-transform duration-200"
              style={{ transform: collapsed['unassigned'] ? 'rotate(0deg)' : 'rotate(180deg)', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {!collapsed['unassigned'] && (
          <div className="pb-1">
            {TYPES.map((type) => {
              const items = unassignedAnnotations.filter((a) => a.type === type);
              if (items.length === 0) return null;
              const typeKey = `unassigned:${type}`;
              return (
                <TypeGroup
                  key={typeKey}
                  type={type}
                  items={items}
                  isCollapsed={collapsed[typeKey]}
                  isVisible={visibility[type]}
                  onToggleCollapse={() => toggleCollapsed(typeKey)}
                  onToggleVisibility={() => toggleVisibility(type)}
                  onAnnotationSelect={onAnnotationSelect}
                  selectedId={selectedId}
                  indent
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Global visibility toggles */}
      <div className="border-b border-[var(--border)] px-4 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
          Visibilité
        </span>
      </div>
      {TYPES.map((type) => (
        <div key={`vis-${type}`} className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-1.5">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: ANNOTATION_COLORS[type],
              opacity: visibility[type] ? 1 : 0.3,
              boxShadow: visibility[type] ? `0 0 6px ${ANNOTATION_COLORS[type]}40` : 'none',
            }}
          />
          <span className={`flex-1 text-[12px] ${visibility[type] ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
            {ANNOTATION_LABELS[type]}
          </span>
          <button
            onClick={() => toggleVisibility(type)}
            className="rounded-md p-1.5 text-[var(--text-tertiary)] transition-colors duration-150 hover:bg-white/6 hover:text-[var(--text-secondary)]"
            aria-label={visibility[type] ? `Masquer ${ANNOTATION_LABELS[type]}` : `Afficher ${ANNOTATION_LABELS[type]}`}
            aria-pressed={visibility[type]}
          >
            {visibility[type] ? (
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
      ))}
    </div>
  );
}

// ─── TypeGroup sub-component ─────────────────────────────────

function TypeGroup({
  type,
  items,
  isCollapsed,
  isVisible,
  onToggleCollapse,
  onToggleVisibility,
  onAnnotationSelect,
  selectedId,
  indent,
}: {
  type: AnnotationType;
  items: Annotation[];
  isCollapsed?: boolean;
  isVisible: boolean;
  onToggleCollapse: () => void;
  onToggleVisibility: () => void;
  onAnnotationSelect: (ann: Annotation) => void;
  selectedId: string | null;
  indent?: boolean;
}) {
  return (
    <div className={indent ? 'pl-4' : ''}>
      <div className="flex w-full items-center gap-2 px-4 py-1.5">
        <button
          onClick={onToggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label={`${ANNOTATION_LABELS[type]} — ${isCollapsed ? 'développer' : 'réduire'}`}
          className="flex flex-1 items-center gap-2 text-left transition-colors duration-150 hover:opacity-80"
        >
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: ANNOTATION_COLORS[type],
              opacity: isVisible ? 1 : 0.3,
              boxShadow: isVisible ? `0 0 4px ${ANNOTATION_COLORS[type]}40` : 'none',
            }}
          />
          <span className={`flex-1 text-[11px] font-medium transition-colors duration-150 ${isVisible ? 'text-[var(--text-secondary)]' : 'text-[var(--text-tertiary)]'}`}>
            {ANNOTATION_LABELS[type]}
          </span>
          <span className="min-w-[14px] text-center font-mono text-[9px] text-[var(--text-tertiary)]">
            {items.length}
          </span>
          <svg
            className="h-2.5 w-2.5 text-[var(--text-tertiary)] transition-transform duration-200"
            style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          onClick={onToggleVisibility}
          className="rounded-md p-1 text-[var(--text-tertiary)] transition-colors duration-150 hover:bg-white/6 hover:text-[var(--text-secondary)]"
          aria-label={isVisible ? `Masquer ${ANNOTATION_LABELS[type]}` : `Afficher ${ANNOTATION_LABELS[type]}`}
          aria-pressed={isVisible}
        >
          {isVisible ? (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </button>
      </div>

      {!isCollapsed && items.length > 0 && (
        <div className="pb-0.5">
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
