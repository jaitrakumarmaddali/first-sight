import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { workspaceRunner } from '@/lib/workspace/runner';
import { aiPipeline } from '@/lib/ai/pipeline';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, code } = body;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const files = workspace.filesData ? JSON.parse(workspace.filesData) : {};
    const codeToTest = code !== undefined ? code : files['calculator.py'] || '';

    // Run test suite
    const suiteResult = workspaceRunner.runTests(codeToTest);

    // Activity tracking & Gemma filtering
    const eventType = suiteResult.failed > 0 ? 'TEST_FAILED' : 'TEST_PASSED';
    const description = suiteResult.failed > 0
      ? `Tests failed: ${suiteResult.failed}/${suiteResult.total} failing (${suiteResult.results.find(r => !r.passed)?.name})`
      : `All tests passed: ${suiteResult.passed}/${suiteResult.total} assertions OK`;

    const pipelineResult = await aiPipeline.processEvent(workspaceId, {
      eventType,
      category: 'TESTS',
      description,
      metadata: {
        total: suiteResult.total,
        passed: suiteResult.passed,
        failed: suiteResult.failed,
        error: suiteResult.failed > 0 ? 'ZeroDivisionError: division by zero' : null,
      },
    });

    return NextResponse.json({
      testResult: suiteResult,
      pipeline: pipelineResult,
      brainState: pipelineResult.brainState,
      insight: pipelineResult.triggeredInsight,
    });
  } catch (error: any) {
    console.error('Error running test suite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
