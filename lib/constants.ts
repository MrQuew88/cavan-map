import type { AnnotationType, Tool, VisibilityState } from './types';

export const MAP_CONFIG = {
  center: [-7.135, 54.005] as [number, number],
  zoom: 14,
  minZoom: 12,
  maxZoom: 18,
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
};

export const ANNOTATION_COLORS: Record<AnnotationType, string> = {
  target_zone: '#ff6b35',
  depth_point: '#4da6ff',
  isobath: '#00c9a7',
  dropoff: '#ff4444',
  spawn_zone: '#4caf50',
  accumulation_zone: '#e040fb',
  note: '#ffffff',
};

export const ANNOTATION_LABELS: Record<AnnotationType, string> = {
  target_zone: 'Target Zone',
  depth_point: 'Depth Point',
  isobath: 'Isobath Line',
  dropoff: 'Drop-off',
  spawn_zone: 'Spawning Zone',
  accumulation_zone: 'Accumulation Zone',
  note: 'Note',
};

export const TOOL_LABELS: Record<Tool, string> = {
  pointer: 'Pointer',
  target_zone: 'Target Zone',
  depth_point: 'Depth Point',
  isobath: 'Isobath',
  dropoff: 'Drop-off',
  spawn_zone: 'Spawn Zone',
  accumulation_zone: 'Accumulation',
  note: 'Note',
};

export const DRAWING_INSTRUCTIONS: Record<Tool, string> = {
  pointer: '',
  target_zone: 'Click on the map to place a target zone',
  depth_point: 'Click on the map to place a depth point',
  isobath: 'Click to add points. Double-click to finish the line.',
  dropoff: 'Click to add points. Double-click to finish the line.',
  spawn_zone: 'Click to add vertices. Double-click to close the polygon.',
  accumulation_zone: 'Click to add vertices. Double-click to close the polygon.',
  note: 'Click on the map to place a note',
};

export const TOOL_GEOMETRY: Record<Tool, 'point' | 'line' | 'polygon' | null> = {
  pointer: null,
  target_zone: 'point',
  depth_point: 'point',
  isobath: 'line',
  dropoff: 'line',
  spawn_zone: 'polygon',
  accumulation_zone: 'polygon',
  note: 'point',
};

export const PRIORITY_COLORS = {
  high: '#ff4444',
  medium: '#ffaa00',
  low: '#44aa44',
};

export const DEFAULT_VISIBILITY: VisibilityState = {
  target_zone: true,
  depth_point: true,
  isobath: true,
  dropoff: true,
  spawn_zone: true,
  accumulation_zone: true,
  note: true,
};

export const SEASONS = ['spring', 'summer', 'autumn', 'winter', 'all'] as const;
export const CONFIDENCE_LEVELS = ['confirmed', 'likely', 'speculative'] as const;
export const PRIORITIES = ['high', 'medium', 'low'] as const;
