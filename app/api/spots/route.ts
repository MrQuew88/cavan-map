import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSpots, createSpot } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const spots = await getSpots(session.user.email);
    return NextResponse.json(spots);
  } catch (error) {
    console.error('Failed to fetch spots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const spot = { ...body, userId: session.user.email };
    const created = await createSpot(spot);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create spot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
