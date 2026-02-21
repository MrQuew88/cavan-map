import type { AnnotationType, Tool, VisibilityState, Season, Confidence, Priority } from './types';

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
  target_zone: 'Zone Cible',
  depth_point: 'Point de Profondeur',
  isobath: 'Isobathe',
  dropoff: 'Cassure',
  spawn_zone: 'Zone de Fraie',
  accumulation_zone: "Zone d'Accumulation",
  note: 'Note',
};

export const TOOL_LABELS: Record<Tool, string> = {
  pointer: 'Sélection',
  target_zone: 'Zone Cible',
  depth_point: 'Profondeur',
  isobath: 'Isobathe',
  dropoff: 'Cassure',
  spawn_zone: 'Fraie',
  accumulation_zone: 'Accumulation',
  note: 'Note',
};

export const DRAWING_INSTRUCTIONS: Record<Tool, string> = {
  pointer: '',
  target_zone: 'Cliquez sur la carte pour placer une zone cible',
  depth_point: 'Cliquez sur la carte pour placer un point de profondeur',
  isobath: 'Cliquez pour ajouter des points. Double-clic pour terminer la ligne.',
  dropoff: 'Cliquez pour ajouter des points. Double-clic pour terminer la ligne.',
  spawn_zone: 'Cliquez pour ajouter des sommets. Double-clic pour fermer le polygone.',
  accumulation_zone: 'Cliquez pour ajouter des sommets. Double-clic pour fermer le polygone.',
  note: 'Cliquez sur la carte pour placer une note',
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

export const PRIORITY_COLORS: Record<Priority, string> = {
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

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'Printemps',
  summer: 'Été',
  autumn: 'Automne',
  winter: 'Hiver',
  all: 'Toute saison',
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  confirmed: 'Confirmé',
  likely: 'Probable',
  speculative: 'Spéculatif',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
};
