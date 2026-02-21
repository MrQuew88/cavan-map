import { sql } from '@vercel/postgres';
import type { Annotation } from './types';

export async function getAnnotations(userId: string): Promise<Annotation[]> {
  const { rows } = await sql`
    SELECT id, type, user_id as "userId", label, notes, data,
           created_at as "createdAt", updated_at as "updatedAt"
    FROM annotations
    WHERE user_id = ${userId}
    ORDER BY created_at ASC
  `;

  return rows.map((row) => ({
    ...JSON.parse(row.data),
    id: row.id,
    type: row.type,
    userId: row.userId,
    label: row.label,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function createAnnotation(annotation: Annotation): Promise<Annotation> {
  const { id, type, userId, label, notes, ...rest } = annotation;
  const data = JSON.stringify(rest);

  await sql`
    INSERT INTO annotations (id, type, user_id, label, notes, data, created_at, updated_at)
    VALUES (${id}, ${type}, ${userId}, ${label}, ${notes}, ${data}, NOW(), NOW())
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
  const currentData = JSON.parse(row.data);
  const { type: _t, userId: _u, id: _i, createdAt: _c, updatedAt: _up, label, notes, ...restUpdates } = updates as Record<string, unknown>;

  const newData = JSON.stringify({ ...currentData, ...restUpdates });
  const newLabel = (label as string) ?? row.label;
  const newNotes = (notes as string) ?? row.notes;

  await sql`
    UPDATE annotations
    SET data = ${newData}, label = ${newLabel}, notes = ${newNotes}, updated_at = NOW()
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

export const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS annotations (
  id VARCHAR(36) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  label VARCHAR(10) NOT NULL,
  notes TEXT DEFAULT '',
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annotations_user_id ON annotations(user_id);
CREATE INDEX IF NOT EXISTS idx_annotations_type ON annotations(type);
`;
