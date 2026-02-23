import { sql } from '@vercel/postgres';
import type { Annotation, Spot } from './types';

// ─── Annotations ─────────────────────────────────────────────

export async function getAnnotations(userId: string): Promise<Annotation[]> {
  const { rows } = await sql`
    SELECT id, type, user_id as "userId", label, notes, spot_id as "spotId", data,
           created_at as "createdAt", updated_at as "updatedAt"
    FROM annotations
    WHERE user_id = ${userId}
    ORDER BY created_at ASC
  `;

  return rows.map((row) => {
    const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data ?? {});
    return {
      ...parsed,
      id: row.id,
      type: row.type,
      userId: row.userId,
      label: row.label,
      notes: row.notes ?? '',
      spotId: row.spotId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  });
}

export async function createAnnotation(annotation: Annotation): Promise<Annotation> {
  const { id, type, userId, label, notes, spotId, createdAt: _ca, updatedAt: _ua, ...rest } = annotation;
  const data = JSON.stringify(rest);
  const spotIdValue = spotId ?? null;

  await sql`
    INSERT INTO annotations (id, type, user_id, label, notes, spot_id, data, created_at, updated_at)
    VALUES (${id}, ${type}, ${userId}, ${label}, ${notes}, ${spotIdValue}, ${data}, NOW(), NOW())
  `;

  return annotation;
}

export async function updateAnnotation(
  id: string,
  userId: string,
  updates: Partial<Annotation>
): Promise<Annotation | null> {
  const existing = await sql`
    SELECT * FROM annotations WHERE id = ${id} AND user_id = ${userId}
  `;

  if (existing.rows.length === 0) return null;

  const row = existing.rows[0];
  const currentData = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data ?? {});
  const { type: _t, userId: _u, id: _i, createdAt: _c, updatedAt: _up, label, notes, spotId, ...restUpdates } = updates as Record<string, unknown>;

  const newData = JSON.stringify({ ...currentData, ...restUpdates });
  const newLabel = (label as string) ?? row.label;
  const newNotes = (notes as string) ?? row.notes;
  const newSpotId = spotId !== undefined ? (spotId as string | null) : row.spot_id;

  await sql`
    UPDATE annotations
    SET data = ${newData}, label = ${newLabel}, notes = ${newNotes}, spot_id = ${newSpotId ?? null}, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
  `;

  return {
    ...currentData,
    ...restUpdates,
    id: row.id,
    type: row.type,
    userId: row.user_id,
    label: newLabel,
    notes: newNotes,
    spotId: newSpotId ?? null,
    createdAt: row.created_at,
    updatedAt: new Date().toISOString(),
  } as Annotation;
}

export async function deleteAnnotation(id: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM annotations WHERE id = ${id} AND user_id = ${userId}
  `;
  return (result.rowCount ?? 0) > 0;
}

// ─── Spots ───────────────────────────────────────────────────

export async function getSpots(userId: string): Promise<Spot[]> {
  const { rows } = await sql`
    SELECT id, user_id as "userId", name, description,
           center_lat as "centerLat", center_lng as "centerLng", zoom_level as "zoomLevel",
           created_at as "createdAt", updated_at as "updatedAt"
    FROM spots
    WHERE user_id = ${userId}
    ORDER BY created_at ASC
  `;
  return rows as Spot[];
}

export async function createSpot(spot: Spot): Promise<Spot> {
  const { id, userId, name, description, centerLat, centerLng, zoomLevel } = spot;
  await sql`
    INSERT INTO spots (id, user_id, name, description, center_lat, center_lng, zoom_level, created_at, updated_at)
    VALUES (${id}, ${userId}, ${name}, ${description}, ${centerLat}, ${centerLng}, ${zoomLevel}, NOW(), NOW())
  `;
  return spot;
}

export async function updateSpot(
  id: string,
  userId: string,
  updates: Partial<Spot>
): Promise<Spot | null> {
  const existing = await sql`
    SELECT * FROM spots WHERE id = ${id} AND user_id = ${userId}
  `;
  if (existing.rows.length === 0) return null;

  const row = existing.rows[0];
  const newName = (updates.name as string) ?? row.name;
  const newDescription = (updates.description as string) ?? row.description;
  const newCenterLat = updates.centerLat ?? row.center_lat;
  const newCenterLng = updates.centerLng ?? row.center_lng;
  const newZoomLevel = updates.zoomLevel ?? row.zoom_level;

  await sql`
    UPDATE spots
    SET name = ${newName}, description = ${newDescription},
        center_lat = ${newCenterLat}, center_lng = ${newCenterLng}, zoom_level = ${newZoomLevel},
        updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
  `;

  return {
    id: row.id,
    userId: row.user_id,
    name: newName,
    description: newDescription,
    centerLat: newCenterLat,
    centerLng: newCenterLng,
    zoomLevel: newZoomLevel,
    createdAt: row.created_at,
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteSpot(id: string, userId: string): Promise<boolean> {
  // Unlink annotations from this spot before deleting
  await sql`
    UPDATE annotations SET spot_id = NULL WHERE spot_id = ${id} AND user_id = ${userId}
  `;
  const result = await sql`
    DELETE FROM spots WHERE id = ${id} AND user_id = ${userId}
  `;
  return (result.rowCount ?? 0) > 0;
}

export const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spots (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  zoom_level DOUBLE PRECISION NOT NULL DEFAULT 14,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spots_user_id ON spots(user_id);

CREATE TABLE IF NOT EXISTS annotations (
  id VARCHAR(36) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  label VARCHAR(10) NOT NULL,
  notes TEXT DEFAULT '',
  spot_id VARCHAR(36) REFERENCES spots(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annotations_user_id ON annotations(user_id);
CREATE INDEX IF NOT EXISTS idx_annotations_type ON annotations(type);
CREATE INDEX IF NOT EXISTS idx_annotations_spot_id ON annotations(spot_id);
`;
