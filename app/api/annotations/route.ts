import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAnnotations, createAnnotation } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const annotations = await getAnnotations(session.user.email);
    return NextResponse.json(annotations);
  } catch (error) {
    console.error('Failed to fetch annotations:', error);
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
    const annotation = { ...body, userId: session.user.email };
    const created = await createAnnotation(annotation);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create annotation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
