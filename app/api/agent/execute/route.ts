import { NextResponse } from 'next/server';
import { aiPipeline } from '@/lib/ai/pipeline';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actionId } = body;

    if (!actionId) {
      return NextResponse.json({ error: 'Action ID is required' }, { status: 400 });
    }

    const result = await aiPipeline.executeApprovedAction(actionId);

    return NextResponse.json({
      success: true,
      action: result.action,
      execution: result.execution,
      verification: result.verification,
      updatedFiles: result.updatedFiles,
    });
  } catch (error: any) {
    console.error('Error executing approved action:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
