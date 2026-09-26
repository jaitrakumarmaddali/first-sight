import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { DEMO_STEPS } from '@/lib/demo/demo-controller';
import { aiPipeline } from '@/lib/ai/pipeline';

const DEFAULT_CODE = `def calculate(a, b, operation):
    if operation == "add":
        return a + b
    if operation == "subtract":
        return a - b
    if operation == "multiply":
        return a * b
    if operation == "divide":
        return a / b
    return None

if __name__ == "__main__":
    print("Add: 10 + 5 =", calculate(10, 5, "add"))
    print("Divide: 10 / 2 =", calculate(10, 2, "divide"))
    print("Divide by zero:", calculate(10, 0, "divide"))
`;

export async function GET() {
  return NextResponse.json({
    totalSteps: DEMO_STEPS.length,
    steps: DEMO_STEPS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, stepNumber, workspaceId } = body;

    const workspace = await prisma.workspace.findFirst({
      where: workspaceId ? { id: workspaceId } : { slug: 'python-calculator' },
      include: { tasks: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    if (action === 'RESET') {
      // Reset filesData to bug state
      const currentFiles = workspace.filesData ? JSON.parse(workspace.filesData) : {};
      currentFiles['calculator.py'] = DEFAULT_CODE;

      await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          filesData: JSON.stringify(currentFiles),
          activeFile: 'calculator.py',
        },
      });

      // Reset task status
      const task = await prisma.task.findFirst({
        where: { workspaceId: workspace.id, title: 'Build Python Calculator' },
      });

      if (task) {
        await prisma.task.update({
          where: { id: task.id },
          data: { progress: 78, status: 'IN_PROGRESS' },
        });

        await prisma.subtask.updateMany({
          where: { taskId: task.id, title: { in: ['Handle errors', 'Write tests'] } },
          data: { completed: false },
        });
      }

      // Add reset activity
      await prisma.activityEvent.create({
        data: {
          workspaceId: workspace.id,
          eventType: 'TASK_UPDATED',
          category: 'SYSTEM',
          description: 'Demo workspace reset to initial state with division-by-zero bug.',
          isSignificant: true,
          gemmaClass: 'DEMO_RESET',
        },
      });

      return NextResponse.json({
        success: true,
        currentStep: 1,
        stepInfo: DEMO_STEPS[0],
        files: currentFiles,
      });
    }

    // Step Execution Logic
    const targetStep = DEMO_STEPS.find(s => s.step === stepNumber) || DEMO_STEPS[0];
    let resultPayload: any = { stepInfo: targetStep };

    // When advancing through key milestones:
    if (stepNumber === 10 || stepNumber === 11 || stepNumber === 12 || stepNumber === 13) {
      // Ensure the blocker insight exists
      const pipelineRes = await aiPipeline.processEvent(workspace.id, {
        eventType: 'TEST_FAILED',
        category: 'ERRORS',
        description: 'ZeroDivisionError: division by zero (3rd attempt in calculator.py)',
        metadata: {
          error: 'ZeroDivisionError: division by zero',
          attempts: 3,
        },
      });
      resultPayload.pipeline = pipelineRes;
    } else if (stepNumber === 16 || stepNumber === 17) {
      // Suggest Fix step
      let insight = await prisma.aIInsight.findFirst({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: 'desc' },
      });

      if (!insight) {
        insight = await prisma.aIInsight.create({
          data: {
            workspaceId: workspace.id,
            insightType: 'POSSIBLE_BLOCKER',
            title: 'Repeated ZeroDivisionError in calculate()',
            summary: 'The same division error occurred three times.',
            evidence: 'Failed 3 times during execution on calculate(10, 0, "divide").',
            suggestedAction: 'Add division-by-zero validation to calculator.py',
            confidence: 0.94,
            risk: 'LOW',
            status: 'NEW',
          },
        });
      }

      const actionProposal = await aiPipeline.proposeAction(workspace.id, insight.id);
      resultPayload.action = actionProposal;
    } else if (stepNumber === 18 || stepNumber === 19 || stepNumber === 20 || stepNumber === 21 || stepNumber === 22) {
      // Execute and verify
      const action = await prisma.agentAction.findFirst({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: 'desc' },
      });

      if (action) {
        const executionResult = await aiPipeline.executeApprovedAction(action.id);
        resultPayload.execution = executionResult;
      }
    }

    return NextResponse.json({
      success: true,
      currentStep: stepNumber,
      stepInfo: targetStep,
      ...resultPayload,
    });
  } catch (error: any) {
    console.error('Error executing demo step:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
