'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import mapboxgl from 'mapbox-gl';

import { Map } from '@/components/Map';
import { Toolbar } from '@/components/Toolbar';
import { Sidebar } from '@/components/Sidebar';
import { BottomSheet } from '@/components/BottomSheet';
import { AnnotationRenderer } from '@/components/AnnotationRenderer';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { LoginButton } from '@/components/LoginButton';
import { useAnnotations } from '@/hooks/useAnnotations';
import { useSpots } from '@/hooks/useSpots';
import { useMapDraw } from '@/hooks/useMapDraw';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { getNextLabel } from '@/lib/labels';
import { DEFAULT_VISIBILITY, ANNOTATION_LABELS, MAP_CONFIG } from '@/lib/constants';
import type {
  Annotation,
  Spot,
  Tool,
  VisibilityState,
  GeoPoint,
  AnnotationType,
} from '@/lib/types';

function createDefaultAnnotation(
  type: AnnotationType,
  geometry: { position?: GeoPoint; points?: GeoPoint[] },
  label: string,
  userId: string
): Annotation {
  const base = {
    id: uuidv4(),
    userId,
    label,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  switch (type) {
    case 'target_zone':
      return { ...base, type, position: geometry.position!, title: '', depth: 0 };
    case 'depth_point':
      return { ...base, type, position: geometry.position!, depth: 0 };
    case 'isobath':
      return { ...base, type, points: geometry.points!, depth: 0 };
    case 'dropoff':
      return { ...base, type, points: geometry.points!, shallowDepth: 0, deepDepth: 0 };
    case 'spawn_zone':
      return { ...base, type, points: geometry.points!, species: '', season: 'spring', confidence: 'speculative' };
    case 'accumulation_zone':
      return { ...base, type, points: geometry.points!, foodType: '', season: 'all', confidence: 'speculative' };
    case 'note':
      return { ...base, type, position: geometry.position! };
  }
}

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const hasAnimated = useRef(false);

  const {
    annotations,
    setAnnotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
  } = useAnnotations();

  const {
    spots,
    createSpot,
    updateSpot,
    deleteSpot,
  } = useSpots();

  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('pointer');
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [visibility, setVisibility] = useState<VisibilityState>(DEFAULT_VISIBILITY);
  const [deleteTarget, setDeleteTarget] = useState<Annotation | null>(null);
  const [popup, setPopup] = useState<mapboxgl.Popup | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Entrance orchestration: fly-in + UI reveal
  useEffect(() => {
    if (!map || hasAnimated.current) return;
    hasAnimated.current = true;

    map.flyTo({
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      duration: 2000,
      easing: (t) => 1 - Math.pow(1 - t, 3), // ease-out cubic
    });

    setTimeout(() => setEntered(true), 200);
  }, [map]);

  const getLabel = useCallback(
    (type: AnnotationType) => {
      const existing = annotations
        .filter((a) => a.type === type)
        .map((a) => a.label);
      return getNextLabel(existing);
    },
    [annotations]
  );

  const handlePointPlaced = useCallback(
    (point: GeoPoint) => {
      if (activeTool === 'pointer') return;
      const type = activeTool as AnnotationType;
      const label = getLabel(type);
      const ann = createDefaultAnnotation(type, { position: point }, label, '');
      setEditingAnnotation(ann);
      setFormMode('create');
      setActiveTool('pointer');
    },
    [activeTool, getLabel]
  );

  const handleLineComplete = useCallback(
    (points: GeoPoint[]) => {
      const type = activeTool as AnnotationType;
      const label = getLabel(type);
      const ann = createDefaultAnnotation(type, { points }, label, '');
      setEditingAnnotation(ann);
      setFormMode('create');
      setActiveTool('pointer');
    },
    [activeTool, getLabel]
  );

  const handlePolygonComplete = useCallback(
    (points: GeoPoint[]) => {
      const type = activeTool as AnnotationType;
      const label = getLabel(type);
      const ann = createDefaultAnnotation(type, { points }, label, '');
      setEditingAnnotation(ann);
      setFormMode('create');
      setActiveTool('pointer');
    },
    [activeTool, getLabel]
  );

  useMapDraw({
    map,
    activeTool,
    onPointPlaced: handlePointPlaced,
    onLineComplete: handleLineComplete,
    onPolygonComplete: handlePolygonComplete,
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTool('pointer');
        setEditingAnnotation(null);
        setFormMode(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleAnnotationClick = useCallback(
    (ann: Annotation) => {
      setSelectedAnnotation(ann);

      if (popup) popup.remove();

      if (!map) return;

      let lngLat: [number, number];
      if ('position' in ann) {
        lngLat = [ann.position.lng, ann.position.lat];
      } else if ('points' in ann && ann.points.length > 0) {
        const avgLng = ann.points.reduce((s, p) => s + p.lng, 0) / ann.points.length;
        const avgLat = ann.points.reduce((s, p) => s + p.lat, 0) / ann.points.length;
        lngLat = [avgLng, avgLat];
      } else {
        return;
      }

      const container = document.createElement('div');
      const root = document.createElement('div');
      container.appendChild(root);

      const typeLabel = ANNOTATION_LABELS[ann.type];
      root.innerHTML = `
        <div style="min-width:190px;padding:14px;font-family:'Source Sans 3',system-ui,sans-serif">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
            <span style="font-size:11px;color:var(--text-tertiary,#6d6052);font-weight:500;letter-spacing:0.03em">${typeLabel}</span>
            <span style="margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:var(--text-primary,#ede6db)">${ann.label}</span>
          </div>
          <div style="font-size:12px;color:var(--text-secondary,#a89882);margin-bottom:12px;line-height:1.5">${ann.notes || 'Aucune note'}</div>
          <button id="popup-edit" style="background:var(--accent,#d4915c);color:#1a1712;border:none;border-radius:10px;padding:8px 16px;font-size:12px;font-weight:600;cursor:pointer;width:100%;font-family:'Source Sans 3',sans-serif;letter-spacing:0.01em;transition:opacity 0.15s cubic-bezier(0.16,1,0.3,1)">Modifier</button>
        </div>
      `;

      const newPopup = new mapboxgl.Popup({ closeOnClick: true, maxWidth: '260px' })
        .setLngLat(lngLat)
        .setDOMContent(container)
        .addTo(map);

      root.querySelector('#popup-edit')?.addEventListener('click', () => {
        setEditingAnnotation(ann);
        setFormMode('edit');
        newPopup.remove();
      });

      setPopup(newPopup);
    },
    [map, popup]
  );

  const handleSave = useCallback(
    async (ann: Annotation) => {
      if (formMode === 'create') {
        await createAnnotation(ann);
      } else {
        await updateAnnotation(ann.id, ann);
      }
      setEditingAnnotation(null);
      setFormMode(null);
    },
    [formMode, createAnnotation, updateAnnotation]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const ann = annotations.find((a) => a.id === id);
      if (ann) setDeleteTarget(ann);
    },
    [annotations]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteAnnotation(deleteTarget.id);
    setDeleteTarget(null);
    setEditingAnnotation(null);
    setFormMode(null);
    setSelectedAnnotation(null);
    if (popup) popup.remove();
  }, [deleteTarget, deleteAnnotation, popup]);

  const handleCreateSpot = useCallback(() => {
    if (!map) return;
    const center = map.getCenter();
    const zoom = map.getZoom();
    const spot: Spot = {
      id: uuidv4(),
      userId: '',
      name: 'Nouveau spot',
      description: '',
      centerLat: center.lat,
      centerLng: center.lng,
      zoomLevel: zoom,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    createSpot(spot);
  }, [map, createSpot]);

  const handleDeleteSpot = useCallback(
    async (id: string) => {
      await deleteSpot(id);
      setAnnotations((prev) =>
        prev.map((a) => (a.spotId === id ? { ...a, spotId: null } as Annotation : a))
      );
    },
    [deleteSpot, setAnnotations]
  );

  const handleUpdateSpot = useCallback(
    async (id: string, updates: Partial<Spot>) => {
      await updateSpot(id, updates);
    },
    [updateSpot]
  );

  const handleAnnotationSelect = useCallback(
    (ann: Annotation) => {
      setSelectedAnnotation(ann);

      if (!map) return;

      let lngLat: [number, number];
      if ('position' in ann) {
        lngLat = [ann.position.lng, ann.position.lat];
      } else if ('points' in ann && ann.points.length > 0) {
        const avgLng = ann.points.reduce((s, p) => s + p.lng, 0) / ann.points.length;
        const avgLat = ann.points.reduce((s, p) => s + p.lat, 0) / ann.points.length;
        lngLat = [avgLng, avgLat];
      } else {
        return;
      }

      map.flyTo({ center: lngLat, zoom: 16, duration: 1000 });
    },
    [map]
  );

  if (status === 'loading') {
    return (
      <div className="flex h-dvh items-center justify-center bg-[var(--bg)]" role="status">
        <div className="flex flex-col items-center gap-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)]" />
          <span className="text-xs font-light tracking-wide text-[var(--text-tertiary)]">Chargement\u2026</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const sharedProps = {
    annotations,
    spots,
    map,
    visibility,
    onVisibilityChange: setVisibility,
    onAnnotationSelect: handleAnnotationSelect,
    selectedAnnotation,
    editingAnnotation,
    onSave: handleSave,
    onDelete: handleDelete,
    onCancelEdit: () => {
      setEditingAnnotation(null);
      setFormMode(null);
    },
    onCreateSpot: handleCreateSpot,
    onDeleteSpot: handleDeleteSpot,
    onUpdateSpot: handleUpdateSpot,
    formMode,
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header
        className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--border)] px-4 backdrop-blur-xl"
        style={{ background: 'rgba(34, 31, 25, 0.8)' }}
      >
        <h1 className="text-[13px] font-semibold tracking-tight text-[var(--text-primary)]">
          Cavan<span className="ml-1 font-light text-[var(--text-tertiary)]">Map</span>
        </h1>
        <LoginButton />
      </header>

      <div id="main-content" className="relative flex flex-1 overflow-hidden">
        {isDesktop && (
          <div
            style={{
              animation: entered ? 'sidebar-enter 500ms cubic-bezier(0.32, 0.72, 0, 1) forwards' : 'none',
              opacity: entered ? undefined : 0,
            }}
          >
            <Sidebar {...sharedProps} />
          </div>
        )}

        <div className="relative flex-1">
          <Map onMapReady={setMap} initialZoom={11} />

          <AnnotationRenderer
            map={map}
            annotations={annotations}
            visibility={visibility}
            onAnnotationClick={handleAnnotationClick}
          />

          <div
            className="absolute left-1/2 top-3 z-10 -translate-x-1/2"
            style={{
              animation: entered ? 'fade-in-up 300ms cubic-bezier(0.16, 1, 0.3, 1) 400ms forwards' : 'none',
              opacity: entered ? undefined : 0,
            }}
          >
            <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />
          </div>
        </div>

        {!isDesktop && <BottomSheet {...sharedProps} />}
      </div>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        label={deleteTarget?.label ?? ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
