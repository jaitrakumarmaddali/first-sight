export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    const where: any = {};
    if (workspaceId) where.workspaceId = workspaceId;

    const actions = await prisma.agentAction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        insight: true,
        executions: {
          include: { verification: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ actions });
  } catch (error: any) {
    console.error('Error fetching agent actions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
