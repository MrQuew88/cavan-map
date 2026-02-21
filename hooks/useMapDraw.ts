'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import type { GeoPoint, Tool } from '@/lib/types';
import { TOOL_GEOMETRY } from '@/lib/constants';

interface UseMapDrawOptions {
  map: MapboxMap | null;
  activeTool: Tool;
  onPointPlaced: (point: GeoPoint) => void;
  onLineComplete: (points: GeoPoint[]) => void;
  onPolygonComplete: (points: GeoPoint[]) => void;
}

export function useMapDraw({
  map,
  activeTool,
  onPointPlaced,
  onLineComplete,
  onPolygonComplete,
}: UseMapDrawOptions) {
  const [drawingPoints, setDrawingPoints] = useState<GeoPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawingPointsRef = useRef<GeoPoint[]>([]);

  const geometry = TOOL_GEOMETRY[activeTool];

  const resetDrawing = useCallback(() => {
    setDrawingPoints([]);
    drawingPointsRef.current = [];
    setIsDrawing(false);

    if (map) {
      if (map.getSource('drawing-preview')) {
        (map.getSource('drawing-preview') as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
    }
  }, [map]);

  const updatePreview = useCallback(
    (points: GeoPoint[]) => {
      if (!map || points.length === 0) return;

      if (!map.getSource('drawing-preview')) {
        map.addSource('drawing-preview', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        map.addLayer({
          id: 'drawing-preview-line',
          type: 'line',
          source: 'drawing-preview',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-color': '#ffffff',
            'line-width': 2,
            'line-dasharray': [3, 3],
          },
        });
        map.addLayer({
          id: 'drawing-preview-fill',
          type: 'fill',
          source: 'drawing-preview',
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': '#ffffff',
            'fill-opacity': 0.15,
          },
        });
        map.addLayer({
          id: 'drawing-preview-points',
          type: 'circle',
          source: 'drawing-preview',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': 5,
            'circle-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#000000',
          },
        });
      }

      const features: GeoJSON.Feature[] = points.map((p) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: {},
      }));

      if (points.length >= 2) {
        const coords = points.map((p) => [p.lng, p.lat]);
        if (geometry === 'polygon' && points.length >= 3) {
          features.push({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[...coords, coords[0]]],
            },
            properties: {},
          });
        }
        features.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords },
          properties: {},
        });
      }

      (map.getSource('drawing-preview') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features,
      });
    },
    [map, geometry]
  );

  // Click handler
  useEffect(() => {
    if (!map || !geometry) return;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const point: GeoPoint = { lng: e.lngLat.lng, lat: e.lngLat.lat };

      if (geometry === 'point') {
        onPointPlaced(point);
        return;
      }

      const newPoints = [...drawingPointsRef.current, point];
      drawingPointsRef.current = newPoints;
      setDrawingPoints(newPoints);
      setIsDrawing(true);
      updatePreview(newPoints);
    };

    const handleDblClick = (e: mapboxgl.MapMouseEvent) => {
      if (!isDrawing && drawingPointsRef.current.length === 0) return;

      e.preventDefault();
      const points = drawingPointsRef.current;

      if (geometry === 'line' && points.length >= 2) {
        onLineComplete(points);
        resetDrawing();
      } else if (geometry === 'polygon' && points.length >= 3) {
        onPolygonComplete(points);
        resetDrawing();
      }
    };

    map.on('click', handleClick);
    map.on('dblclick', handleDblClick);

    return () => {
      map.off('click', handleClick);
      map.off('dblclick', handleDblClick);
    };
  }, [map, geometry, activeTool, onPointPlaced, onLineComplete, onPolygonComplete, isDrawing, resetDrawing, updatePreview]);

  // Cursor change
  useEffect(() => {
    if (!map) return;
    const canvas = map.getCanvas();

    if (geometry) {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = '';
    }

    return () => {
      canvas.style.cursor = '';
    };
  }, [map, geometry]);

  // Reset on tool change
  useEffect(() => {
    resetDrawing();
  }, [activeTool, resetDrawing]);

  return {
    drawingPoints,
    isDrawing,
    resetDrawing,
  };
}
