import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { workspaceRunner } from '@/lib/workspace/runner';
import { aiPipeline } from '@/lib/ai/pipeline';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, filename, code } = body;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const files = workspace.filesData ? JSON.parse(workspace.filesData) : {};
    const codeToRun = code !== undefined ? code : files[filename || 'calculator.py'] || '';

    // Run execution in workspace sandbox
    const result = workspaceRunner.executeCode(codeToRun, filename || 'calculator.py');

    // Pipeline processing: feeds event into Gemma 4 and Gemini 3.8 Flash
    const eventCategory = result.hasError ? 'ERRORS' : 'TESTS';
    const eventType = result.hasError ? 'CODE_RUN' : 'CODE_RUN';

    const pipelineResult = await aiPipeline.processEvent(workspaceId, {
      eventType,
      category: eventCategory,
      description: result.hasError
        ? `Execution failed: ${result.errorName || 'Runtime error'}`
        : `Executed ${filename || 'calculator.py'} successfully`,
      metadata: {
        filename: filename || 'calculator.py',
        exitCode: result.exitCode,
        hasError: result.hasError,
        error: result.errorName || (result.hasError ? result.stderr : null),
        executionTimeMs: result.executionTimeMs,
      },
    });

    return NextResponse.json({
      runResult: result,
      pipeline: pipelineResult,
      brainState: pipelineResult.brainState,
      insight: pipelineResult.triggeredInsight,
    });
  } catch (error: any) {
    console.error('Error running code:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
