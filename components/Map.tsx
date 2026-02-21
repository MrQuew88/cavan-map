'use client';

import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAP_CONFIG } from '@/lib/constants';

interface MapProps {
  onMapReady: (map: mapboxgl.Map) => void;
}

export function Map({ onMapReady }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_CONFIG.style,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      doubleClickZoom: false,
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
  }, [onMapReady]);

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
