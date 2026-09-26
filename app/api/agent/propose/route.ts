import { NextResponse } from 'next/server';
import { aiPipeline } from '@/lib/ai/pipeline';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, insightId } = body;

    const action = await aiPipeline.proposeAction(workspaceId, insightId);

    return NextResponse.json({
      success: true,
      action,
    });
  } catch (error: any) {
    console.error('Error proposing agent action:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
