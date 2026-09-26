export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    const where: any = {};
    if (workspaceId) where.workspaceId = workspaceId;

    const insights = await prisma.aIInsight.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { agentActions: true },
    });

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error('Error fetching insights:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { insightId, status } = body;

    const updated = await prisma.aIInsight.update({
      where: { id: insightId },
      data: { status },
    });

    return NextResponse.json({ insight: updated });
  } catch (error: any) {
    console.error('Error updating insight:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
