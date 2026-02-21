import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS annotations (
        id VARCHAR(36) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        label VARCHAR(10) NOT NULL,
        notes TEXT DEFAULT '',
        data JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_annotations_user_id ON annotations(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_annotations_type ON annotations(type)`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
