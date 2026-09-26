export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: any = {};
    if (workspaceId) where.workspaceId = workspaceId;
    if (category && category !== 'ALL') {
      where.category = category.toUpperCase();
    }

    const events = await prisma.activityEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, eventType, category, description, metadata, isSignificant } = body;

    const event = await prisma.activityEvent.create({
      data: {
        workspaceId,
        eventType,
        category: category || 'SYSTEM',
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        isSignificant: isSignificant !== undefined ? isSignificant : true,
      },
    });

    return NextResponse.json({ event });
  } catch (error: any) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
