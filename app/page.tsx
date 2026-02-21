'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import mapboxgl from 'mapbox-gl';

import { Map } from '@/components/Map';
import { Toolbar } from '@/components/Toolbar';
import { Sidebar } from '@/components/Sidebar';
import { BottomSheet } from '@/components/BottomSheet';
import { AnnotationRenderer } from '@/components/AnnotationRenderer';
import { AnnotationPopup } from '@/components/AnnotationPopup';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { LoginButton } from '@/components/LoginButton';
import { useAnnotations } from '@/hooks/useAnnotations';
import { useMapDraw } from '@/hooks/useMapDraw';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { getNextLabel } from '@/lib/labels';
import { DEFAULT_VISIBILITY } from '@/lib/constants';
import type {
  Annotation,
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
      return { ...base, type, position: geometry.position!, priority: 'medium', season: 'all', species: '', technique: '' };
    case 'depth_point':
      return { ...base, type, position: geometry.position!, depth: 0, unit: 'm' };
    case 'isobath':
      return { ...base, type, points: geometry.points!, depth: 0, unit: 'm' };
    case 'dropoff':
      return { ...base, type, points: geometry.points!, shallowDepth: 0, deepDepth: 0, unit: 'm' };
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

  const {
    annotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
  } = useAnnotations();

  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('pointer');
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [visibility, setVisibility] = useState<VisibilityState>(DEFAULT_VISIBILITY);
  const [deleteTarget, setDeleteTarget] = useState<Annotation | null>(null);
  const [popup, setPopup] = useState<mapboxgl.Popup | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

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

  // Escape key handler
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

      // Show popup on map
      if (popup) popup.remove();

      if (!map) return;

      let lngLat: [number, number];
      if ('position' in ann) {
        lngLat = [ann.position.lng, ann.position.lat];
      } else if ('points' in ann && ann.points.length > 0) {
        // Center of points
        const avgLng = ann.points.reduce((s, p) => s + p.lng, 0) / ann.points.length;
        const avgLat = ann.points.reduce((s, p) => s + p.lat, 0) / ann.points.length;
        lngLat = [avgLng, avgLat];
      } else {
        return;
      }

      const container = document.createElement('div');
      const root = document.createElement('div');
      container.appendChild(root);

      // Render popup content
      root.innerHTML = `
        <div style="min-width:180px;padding:12px">
          <div style="font-weight:bold;color:white;margin-bottom:4px">${ann.label}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:8px">${ann.notes || 'No notes'}</div>
          <button id="popup-edit" style="background:#2563eb;color:white;border:none;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;width:100%">Edit</button>
        </div>
      `;

      const newPopup = new mapboxgl.Popup({ closeOnClick: true, maxWidth: '250px' })
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
      <div className="flex h-dvh items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const sharedProps = {
    annotations,
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
    formMode,
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Header */}
      <header className="flex h-12 items-center justify-between border-b border-white/10 bg-[#0f0f1a]/95 px-4 backdrop-blur-sm">
        <h1 className="text-sm font-bold text-white">Cavan Map</h1>
        <LoginButton />
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        {isDesktop && <Sidebar {...sharedProps} />}

        {/* Map */}
        <div className="relative flex-1">
          <Map onMapReady={setMap} />

          <AnnotationRenderer
            map={map}
            annotations={annotations}
            visibility={visibility}
            onAnnotationClick={handleAnnotationClick}
          />

          {/* Toolbar - positioned above map */}
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2">
            <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />
          </div>
        </div>

        {/* Mobile Bottom Sheet */}
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
