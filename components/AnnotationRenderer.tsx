'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Annotation, VisibilityState } from '@/lib/types';
import { ANNOTATION_COLORS, PRIORITY_COLORS } from '@/lib/constants';

interface AnnotationRendererProps {
  map: mapboxgl.Map | null;
  annotations: Annotation[];
  visibility: VisibilityState;
  onAnnotationClick: (annotation: Annotation) => void;
}

export function AnnotationRenderer({
  map,
  annotations,
  visibility,
  onAnnotationClick,
}: AnnotationRendererProps) {
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Render point annotations as markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    annotations.forEach((ann) => {
      if (!visibility[ann.type]) return;

      if (ann.type === 'target_zone') {
        const el = document.createElement('div');
        el.className = 'target-zone-marker';
        el.style.cssText = `
          width: 36px; height: 36px; border-radius: 50%;
          background: ${ANNOTATION_COLORS.target_zone};
          border: 3px solid ${PRIORITY_COLORS[ann.priority]};
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: bold; color: white;
          cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        `;
        el.textContent = ann.label;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onAnnotationClick(ann);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([ann.position.lng, ann.position.lat])
          .addTo(map);
        markersRef.current.push(marker);
      }

      if (ann.type === 'depth_point') {
        const el = document.createElement('div');
        el.style.cssText = `
          background: ${ANNOTATION_COLORS.depth_point}; border-radius: 50%;
          width: 24px; height: 24px; display: flex; align-items: center;
          justify-content: center; font-size: 10px; font-weight: bold;
          color: white; cursor: pointer; border: 2px solid rgba(0,0,0,0.3);
        `;
        el.textContent = `${ann.depth}`;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onAnnotationClick(ann);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([ann.position.lng, ann.position.lat])
          .addTo(map);
        markersRef.current.push(marker);
      }

      if (ann.type === 'note') {
        const el = document.createElement('div');
        el.style.cssText = `
          width: 28px; height: 28px; background: white; border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg); cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
        `;
        const inner = document.createElement('span');
        inner.style.cssText = `transform: rotate(45deg); font-size: 12px; font-weight: bold; color: #333;`;
        inner.textContent = ann.label;
        el.appendChild(inner);
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onAnnotationClick(ann);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([ann.position.lng, ann.position.lat])
          .addTo(map);
        markersRef.current.push(marker);
      }
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [map, annotations, visibility, onAnnotationClick]);

  // Render line and polygon annotations as map layers
  useEffect(() => {
    if (!map) return;

    const lineAnnotations = annotations.filter(
      (a) => (a.type === 'isobath' || a.type === 'dropoff') && visibility[a.type]
    );
    const polygonAnnotations = annotations.filter(
      (a) => (a.type === 'spawn_zone' || a.type === 'accumulation_zone') && visibility[a.type]
    );

    // Lines
    const lineFeatures: GeoJSON.Feature[] = lineAnnotations.map((ann) => {
      if (ann.type !== 'isobath' && ann.type !== 'dropoff') throw new Error('unreachable');
      return {
        type: 'Feature',
        properties: {
          id: ann.id,
          type: ann.type,
          color: ANNOTATION_COLORS[ann.type],
          label: ann.type === 'isobath' ? `${ann.depth}${ann.unit}` : `${ann.shallowDepth}→${ann.deepDepth}${ann.unit}`,
        },
        geometry: {
          type: 'LineString',
          coordinates: ann.points.map((p) => [p.lng, p.lat]),
        },
      };
    });

    // Polygons
    const polyFeatures: GeoJSON.Feature[] = polygonAnnotations.map((ann) => {
      if (ann.type !== 'spawn_zone' && ann.type !== 'accumulation_zone') throw new Error('unreachable');
      const coords = ann.points.map((p) => [p.lng, p.lat]);
      return {
        type: 'Feature',
        properties: {
          id: ann.id,
          type: ann.type,
          color: ANNOTATION_COLORS[ann.type],
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[...coords, coords[0]]],
        },
      };
    });

    // Update or create sources
    const lineData: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: lineFeatures };
    const polyData: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: polyFeatures };

    if (map.getSource('annotation-lines')) {
      (map.getSource('annotation-lines') as mapboxgl.GeoJSONSource).setData(lineData);
    } else {
      map.addSource('annotation-lines', { type: 'geojson', data: lineData });
      map.addLayer({
        id: 'annotation-lines-layer',
        type: 'line',
        source: 'annotation-lines',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3,
          'line-dasharray': [
            'case',
            ['==', ['get', 'type'], 'dropoff'],
            ['literal', [4, 3]],
            ['literal', [1, 0]],
          ],
        },
      });
      map.addLayer({
        id: 'annotation-lines-labels',
        type: 'symbol',
        source: 'annotation-lines',
        layout: {
          'symbol-placement': 'line-center',
          'text-field': ['get', 'label'],
          'text-size': 12,
          'text-offset': [0, -1],
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1.5,
        },
      });
    }

    if (map.getSource('annotation-polygons')) {
      (map.getSource('annotation-polygons') as mapboxgl.GeoJSONSource).setData(polyData);
    } else {
      map.addSource('annotation-polygons', { type: 'geojson', data: polyData });
      map.addLayer({
        id: 'annotation-polygons-fill',
        type: 'fill',
        source: 'annotation-polygons',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.2,
        },
      });
      map.addLayer({
        id: 'annotation-polygons-outline',
        type: 'line',
        source: 'annotation-polygons',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-dasharray': [
            'case',
            ['==', ['get', 'type'], 'accumulation_zone'],
            ['literal', [4, 3]],
            ['literal', [1, 0]],
          ],
        },
      });
    }

    // Click handlers for layers
    const handleLineClick = (e: mapboxgl.MapMouseEvent) => {
      if (!e.features?.length) return;
      const id = e.features[0].properties?.id;
      const ann = annotations.find((a) => a.id === id);
      if (ann) onAnnotationClick(ann);
    };

    const handlePolyClick = (e: mapboxgl.MapMouseEvent) => {
      if (!e.features?.length) return;
      const id = e.features[0].properties?.id;
      const ann = annotations.find((a) => a.id === id);
      if (ann) onAnnotationClick(ann);
    };

    map.on('click', 'annotation-lines-layer', handleLineClick);
    map.on('click', 'annotation-polygons-fill', handlePolyClick);

    return () => {
      map.off('click', 'annotation-lines-layer', handleLineClick);
      map.off('click', 'annotation-polygons-fill', handlePolyClick);
    };
  }, [map, annotations, visibility, onAnnotationClick]);

  return null;
}
