import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
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
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_spots_user_id ON spots(user_id)`;

    await sql`
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
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_annotations_user_id ON annotations(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_annotations_type ON annotations(type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_annotations_spot_id ON annotations(spot_id)`;

    // Add spot_id column to existing annotations table (idempotent)
    try {
      await sql`ALTER TABLE annotations ADD COLUMN IF NOT EXISTS spot_id VARCHAR(36) REFERENCES spots(id) ON DELETE SET NULL`;
    } catch {
      // Column may already exist
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
