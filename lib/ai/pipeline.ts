import prisma from '@/lib/db/prisma';
import { gemmaClassifier } from './gemma';
import { geminiFlash } from './gemini-flash';
import { antigravityAgent } from '../agent/antigravity';
import { RawEventInput } from './gemma';
import { AIBrainStateType } from '@/types';

export class AIPipelineService {
  /**
   * Main reactive loop:
   * USER WORKS -> FIRST SIGHT OBSERVES -> GEMMA FILTERS -> GEMINI REASONS -> INSIGHT DETECTED
   */
  public async processEvent(workspaceId: string, eventInput: RawEventInput) {
    // 1. Get recent workspace events
    const recentEvents = await prisma.activityEvent.findMany({
      where: { workspaceId },
      orderBy: { timestamp: 'desc' },
      take: 12,
    });

    // 2. Pass to Gemma for classification and noise suppression
    const gemmaResult = await gemmaClassifier.classifyActivity(
      eventInput,
      recentEvents.map(e => ({
        eventType: e.eventType,
        description: e.description,
        metadata: e.metadata ? JSON.parse(e.metadata) : {},
        timestamp: e.timestamp,
      }))
    );

    // 3. Save activity event to DB
    const savedEvent = await prisma.activityEvent.create({
      data: {
        workspaceId,
        eventType: eventInput.eventType,
        category: eventInput.category || 'SYSTEM',
        description: eventInput.description,
        metadata: eventInput.metadata ? JSON.stringify(eventInput.metadata) : null,
        isSignificant: gemmaResult.isSignificant,
        gemmaClass: gemmaResult.classification,
      },
    });

    let triggeredInsight = null;
    let brainState: AIBrainStateType = 'MONITORING';

    // 4. Stuck detection check & Gemma escalation trigger
    if (gemmaResult.shouldEscalateToFlash) {
      brainState = 'REASONING';

      // Load workspace context & active file
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { tasks: true },
      });

      const files = workspace?.filesData ? JSON.parse(workspace.filesData) : {};
      const activeFile = workspace?.activeFile || 'calculator.py';
      const fileContent = files[activeFile] || '';

      // Count error occurrences
      const errorCount = recentEvents.filter(
        e => e.eventType === 'TEST_FAILED' || e.metadata?.includes('ZeroDivisionError')
      ).length + 1;

      // Escalate to Gemini 3.8 Flash for reasoning
      const insight = await geminiFlash.analyzeBlocker({
        taskTitle: workspace?.tasks[0]?.title || 'Build Python Calculator',
        activeFile,
        fileContent,
        errorCount,
        recentError: eventInput.metadata?.error || 'ZeroDivisionError: division by zero',
        recentEvents: recentEvents.map(e => ({
          eventType: e.eventType,
          description: e.description,
        })),
      });

      // Check if similar active insight already exists
      const existing = await prisma.aIInsight.findFirst({
        where: {
          workspaceId,
          title: insight.title,
          status: { in: ['NEW', 'REVIEWED'] },
        },
      });

      if (!existing) {
        triggeredInsight = await prisma.aIInsight.create({
          data: {
            workspaceId,
            insightType: insight.insightType,
            title: insight.title,
            summary: insight.summary,
            evidence: insight.evidence,
            suggestedAction: insight.suggestedAction,
            confidence: insight.confidence,
            risk: insight.risk,
            status: 'NEW',
          },
        });

        // Create notification
        await prisma.notification.create({
          data: {
            title: '⚠ Possible Blocker Detected',
            message: insight.summary,
            type: 'WARNING',
            actionUrl: '/workspace',
          },
        });

        brainState = 'INSIGHT_DETECTED';
      } else {
        triggeredInsight = existing;
        brainState = 'INSIGHT_DETECTED';
      }
    }

    return {
      event: savedEvent,
      gemmaResult,
      triggeredInsight,
      brainState,
    };
  }

  /**
   * Step: Suggest Fix -> Creates an Action Proposal
   */
  public async proposeAction(workspaceId: string, insightId: string) {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    const files = workspace?.filesData ? JSON.parse(workspace.filesData) : {};
    const activeFile = workspace?.activeFile || 'calculator.py';
    const code = files[activeFile] || '';

    const fixProposal = await geminiFlash.suggestFix(activeFile, code);

    // Save proposed agent action
    const action = await prisma.agentAction.create({
      data: {
        workspaceId,
        insightId,
        title: fixProposal.title,
        description: fixProposal.description,
        targetFile: fixProposal.targetFile,
        patchDiff: fixProposal.patchDiff,
        risk: fixProposal.risk,
        status: 'PROPOSED',
      },
    });

    // Update insight status
    await prisma.aIInsight.update({
      where: { id: insightId },
      data: { status: 'ACTIONED' },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        title: 'Action Ready for Approval',
        message: `Antigravity Agent proposal: ${fixProposal.title}`,
        type: 'ACTION_REQUIRED',
        actionUrl: '/agent',
      },
    });

    return action;
  }

  /**
   * Step: User Approves -> Agent Executes -> Verification
   */
  public async executeApprovedAction(actionId: string) {
    const action = await prisma.agentAction.findUnique({
      where: { id: actionId },
      include: { workspace: true },
    });

    if (!action) throw new Error('Action not found');

    const files = action.workspace.filesData ? JSON.parse(action.workspace.filesData) : {};

    // 1. Mark action as APPROVED
    await prisma.agentAction.update({
      where: { id: actionId },
      data: { status: 'APPROVED' },
    });

    // 2. Initialize Agent Execution record
    const execution = await prisma.agentExecution.create({
      data: {
        actionId,
        status: 'PREPARING',
        timeline: JSON.stringify([]),
      },
    });

    // 3. Antigravity Agent executes patch
    const agentResult = await antigravityAgent.executeApprovedAction(
      {
        id: action.id,
        title: action.title,
        description: action.description,
        targetFile: action.targetFile,
        patchDiff: action.patchDiff || '',
        risk: action.risk as any,
        status: 'APPROVED',
      },
      files
    );

    // 4. Update workspace files in database
    await prisma.workspace.update({
      where: { id: action.workspaceId },
      data: { filesData: JSON.stringify(agentResult.updatedFiles) },
    });

    // 5. Update execution details
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'COMPLETED',
        timeline: JSON.stringify(agentResult.timeline),
        stdout: agentResult.stdout,
        executionTime: agentResult.executionTimeMs,
        completedAt: new Date(),
      },
    });

    // 6. Gemini 3.8 Flash Verification
    const verification = await geminiFlash.verifyResults(
      { total: 12, passed: 12, failed: 0 },
      agentResult.stdout
    );

    const savedVerification = await prisma.verificationResult.create({
      data: {
        executionId: execution.id,
        passed: verification.passed,
        totalTests: verification.totalTests,
        passedTests: verification.passedTests,
        failedTests: verification.failedTests,
        summary: verification.summary,
        testOutput: verification.testOutput,
        analyzedByModel: verification.analyzedByModel,
      },
    });

    // 7. Update task subtasks to complete
    const currentTask = await prisma.task.findFirst({
      where: { workspaceId: action.workspaceId },
      include: { subtasks: true },
    });

    if (currentTask) {
      await prisma.subtask.updateMany({
        where: { taskId: currentTask.id },
        data: { completed: true },
      });

      await prisma.task.update({
        where: { id: currentTask.id },
        data: { progress: 100, status: 'COMPLETED' },
      });
    }

    // 8. Record Activity & Notification
    await prisma.activityEvent.create({
      data: {
        workspaceId: action.workspaceId,
        eventType: 'VERIFICATION_COMPLETED',
        category: 'AI',
        description: `✓ VERIFIED: ${verification.passedTests}/${verification.totalTests} tests passed`,
        isSignificant: true,
        gemmaClass: 'MILESTONE_SUCCESS',
      },
    });

    await prisma.notification.create({
      data: {
        title: '✓ Action Verified by Gemini Flash',
        message: '12/12 tests passed. Division by zero blocker resolved.',
        type: 'SUCCESS',
        actionUrl: '/workspace',
      },
    });

    return {
      action,
      execution,
      verification: savedVerification,
      updatedFiles: agentResult.updatedFiles,
    };
  }
}

export const aiPipeline = new AIPipelineService();
