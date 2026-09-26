export type AIBrainStateType =
  | 'IDLE'
  | 'MONITORING'
  | 'REASONING'
  | 'INSIGHT_DETECTED'
  | 'ACTION_READY'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'ERROR';

export type ActivityEventType =
  | 'FILE_OPENED'
  | 'FILE_EDITED'
  | 'FILE_SAVED'
  | 'CODE_RUN'
  | 'TEST_STARTED'
  | 'TEST_FAILED'
  | 'TEST_PASSED'
  | 'TASK_UPDATED'
  | 'AI_ANALYSIS'
  | 'AI_INSIGHT'
  | 'ACTION_PROPOSED'
  | 'ACTION_APPROVED'
  | 'ACTION_EXECUTED'
  | 'VERIFICATION_STARTED'
  | 'VERIFICATION_COMPLETED';

export type EventCategory = 'FILES' | 'TESTS' | 'AI' | 'AGENT' | 'ERRORS' | 'SYSTEM';

export type InsightType = 'POSSIBLE_BLOCKER' | 'SUGGESTION' | 'PATTERN' | 'RESOLVED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StructuredInsight {
  insightType: InsightType;
  title: string;
  summary: string;
  evidence: string;
  suggestedAction: string;
  confidence: number;
  risk: RiskLevel;
}

export interface ProposedAction {
  id: string;
  insightId?: string;
  title: string;
  description: string;
  targetFile: string;
  patchDiff: string;
  risk: RiskLevel;
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED';
}

export interface ExecutionTimelineStep {
  step: 'APPROVED' | 'PREPARING' | 'EXECUTING' | 'TESTING' | 'VERIFYING' | 'COMPLETED';
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp: string;
  details?: string;
}

export interface VerificationData {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  summary: string;
  testOutput: string;
  analyzedByModel: string;
}

export interface WorkspaceFiles {
  [filename: string]: string;
}

export interface DemoStepInfo {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  autoPlayIntervalMs?: number;
}
