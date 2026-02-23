export type AnnotationType =
  | 'target_zone'
  | 'depth_point'
  | 'isobath'
  | 'dropoff'
  | 'spawn_zone'
  | 'accumulation_zone'
  | 'note';

export type Priority = 'high' | 'medium' | 'low';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';

export type Confidence = 'confirmed' | 'likely' | 'speculative';

export interface GeoPoint {
  lng: number;
  lat: number;
}

export interface Spot {
  id: string;
  userId: string;
  name: string;
  description: string;
  centerLat: number;
  centerLng: number;
  zoomLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface BaseAnnotation {
  id: string;
  type: AnnotationType;
  userId: string;
  label: string;
  notes: string;
  spotId?: string | null;
  createdAt: string;
  updatedAt: string;
  visible?: boolean;
}

export interface TargetZone extends BaseAnnotation {
  type: 'target_zone';
  position: GeoPoint;
  title: string;
  depth: number;
}

export interface DepthPoint extends BaseAnnotation {
  type: 'depth_point';
  position: GeoPoint;
  depth: number;
}

export interface Isobath extends BaseAnnotation {
  type: 'isobath';
  points: GeoPoint[];
  depth: number;
}

export interface DropoffLine extends BaseAnnotation {
  type: 'dropoff';
  points: GeoPoint[];
  shallowDepth: number;
  deepDepth: number;
}

export interface SpawnZone extends BaseAnnotation {
  type: 'spawn_zone';
  points: GeoPoint[];
  species: string;
  season: Season;
  confidence: Confidence;
}

export interface AccumulationZone extends BaseAnnotation {
  type: 'accumulation_zone';
  points: GeoPoint[];
  foodType: string;
  season: Season;
  confidence: Confidence;
}

export interface NoteAnnotation extends BaseAnnotation {
  type: 'note';
  position: GeoPoint;
}

export type Annotation =
  | TargetZone
  | DepthPoint
  | Isobath
  | DropoffLine
  | SpawnZone
  | AccumulationZone
  | NoteAnnotation;

export type PointAnnotation = TargetZone | DepthPoint | NoteAnnotation;
export type LineAnnotation = Isobath | DropoffLine;
export type PolygonAnnotation = SpawnZone | AccumulationZone;

export type Tool =
  | 'pointer'
  | 'target_zone'
  | 'depth_point'
  | 'isobath'
  | 'dropoff'
  | 'spawn_zone'
  | 'accumulation_zone'
  | 'note';

export interface VisibilityState {
  target_zone: boolean;
  depth_point: boolean;
  isobath: boolean;
  dropoff: boolean;
  spawn_zone: boolean;
  accumulation_zone: boolean;
  note: boolean;
}

export interface MapState {
  activeTool: Tool;
  selectedAnnotation: Annotation | null;
  drawingPoints: GeoPoint[];
  isDrawing: boolean;
  visibility: VisibilityState;
}
