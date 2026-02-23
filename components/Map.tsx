'use client';

import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { MAP_CONFIG } from '@/lib/constants';

export interface GeocoderResult {
  name: string;
  center: [number, number];
  bbox?: [number, number, number, number];
}

interface MapProps {
  onMapReady: (map: mapboxgl.Map) => void;
  onGeocoderResult?: (result: GeocoderResult) => void;
  initialZoom?: number;
}

export function Map({ onMapReady, onGeocoderResult, initialZoom }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_CONFIG.style,
      center: MAP_CONFIG.center,
      zoom: initialZoom ?? MAP_CONFIG.zoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      doubleClickZoom: false,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken as string,
      mapboxgl: mapboxgl as any,
      marker: false,
      placeholder: 'Rechercher un lieu\u2026',
      collapsed: true,
    });
    map.addControl(geocoder, 'top-left');

    geocoder.on('result', (e: { result: { place_name?: string; text?: string; center: [number, number]; bbox?: [number, number, number, number] } }) => {
      if (onGeocoderResult) {
        onGeocoderResult({
          name: e.result.text || e.result.place_name || 'Sans nom',
          center: e.result.center,
          bbox: e.result.bbox,
        });
      }
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );
    map.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

    map.on('load', () => {
      mapRef.current = map;
      onMapReady(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMapReady, onGeocoderResult, initialZoom]);

  useEffect(() => {
    const cleanup = initMap();
    return cleanup;
  }, [initMap]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
    />
  );
}
