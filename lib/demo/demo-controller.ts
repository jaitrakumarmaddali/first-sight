export interface DemoStepDefinition {
  step: number;
  title: string;
  description: string;
  brainState: 'MONITORING' | 'REASONING' | 'INSIGHT_DETECTED' | 'ACTION_READY' | 'EXECUTING' | 'VERIFYING' | 'VERIFIED' | 'IDLE';
  actionPrompt?: string;
  terminalOutput?: { stdout: string; stderr: string; exitCode: number };
}

export const DEMO_STEPS: DemoStepDefinition[] = [
  {
    step: 1,
    title: 'Open Python Calculator Workspace',
    description: 'Active workspace loaded with calculator.py, tests.py, and task "Build Python Calculator" at 78%.',
    brainState: 'MONITORING',
  },
  {
    step: 2,
    title: 'User Edits Code',
    description: 'Developer modifying calculate() function logic in calculator.py.',
    brainState: 'MONITORING',
  },
  {
    step: 3,
    title: 'Run Code (Attempt 1)',
    description: 'Executing python calculator.py...',
    brainState: 'MONITORING',
    terminalOutput: {
      stdout: 'Add: 10 + 5 = 15\nDivide: 10 / 2 = 5.0\n',
      stderr: 'Traceback (most recent call last):\n  File "calculator.py", line 18, in <module>\n    print("Divide by zero:", calculate(10, 0, "divide"))\n  File "calculator.py", line 10, in calculate\n    return a / b\nZeroDivisionError: division by zero',
      exitCode: 1,
    },
  },
  {
    step: 4,
    title: 'Error Encountered: ZeroDivisionError',
    description: 'First failure: Runtime exception on divide by zero.',
    brainState: 'MONITORING',
  },
  {
    step: 5,
    title: 'User Adjusts Code (Attempt 2)',
    description: 'Developer tries adjusting print statement and rerunning without fixing root guard.',
    brainState: 'MONITORING',
  },
  {
    step: 6,
    title: 'Run Code Again (Attempt 2)',
    description: 'Executing python calculator.py a second time...',
    brainState: 'MONITORING',
    terminalOutput: {
      stdout: 'Add: 10 + 5 = 15\nDivide: 10 / 2 = 5.0\n',
      stderr: 'ZeroDivisionError: division by zero (2nd occurrence)',
      exitCode: 1,
    },
  },
  {
    step: 7,
    title: 'Same Error Persists',
    description: 'Second identical failure recorded in event log.',
    brainState: 'MONITORING',
  },
  {
    step: 8,
    title: 'Run Code Third Time (Attempt 3)',
    description: 'Developer runs tests / execution again. Third consecutive failure occurs.',
    brainState: 'MONITORING',
    terminalOutput: {
      stdout: 'Add: 10 + 5 = 15\nDivide: 10 / 2 = 5.0\n',
      stderr: 'ZeroDivisionError: division by zero (3rd occurrence)',
      exitCode: 1,
    },
  },
  {
    step: 9,
    title: 'Activity Timeline Updates',
    description: 'Activity stream records repeated failure cluster in real time.',
    brainState: 'MONITORING',
  },
  {
    step: 10,
    title: 'Gemma 4 Classifies Repeated Failures',
    description: 'Edge model filters out noisy events and tags signature: CRITICAL_REPEATED_FAILURE (Escalate: True).',
    brainState: 'MONITORING',
  },
  {
    step: 11,
    title: 'Gemini 3.8 Flash Analyzes Context',
    description: 'Gemini Flash ingests workspace context, task status, and error stack trace for deep reasoning.',
    brainState: 'REASONING',
  },
  {
    step: 12,
    title: 'AI Brain State Transition',
    description: 'Brain widget dynamically transitions: MONITORING → REASONING → INSIGHT DETECTED.',
    brainState: 'INSIGHT_DETECTED',
  },
  {
    step: 13,
    title: '⚠ Possible Blocker Surfaced',
    description: 'First Sight notices before user asks: "The same division error occurred 3 times."',
    brainState: 'INSIGHT_DETECTED',
  },
  {
    step: 14,
    title: 'User Clicks "Explain"',
    description: 'User requests concise explanation of why the blocker is occurring.',
    brainState: 'INSIGHT_DETECTED',
  },
  {
    step: 15,
    title: 'Gemini Explains Root Cause',
    description: 'Concise explanation delivered: Missing denominator guard before division.',
    brainState: 'INSIGHT_DETECTED',
  },
  {
    step: 16,
    title: 'User Clicks "Suggest Fix"',
    description: 'Generating concrete action proposal with code patch.',
    brainState: 'ACTION_READY',
  },
  {
    step: 17,
    title: 'ACTION READY: Action Proposal Created',
    description: 'Proposal: "Add division-by-zero validation to calculator.py". Awaiting user sanction.',
    brainState: 'ACTION_READY',
  },
  {
    step: 18,
    title: 'User Clicks "Approve"',
    description: 'User reviews diff and explicitly clicks [Approve]. Safety boundary respected.',
    brainState: 'EXECUTING',
  },
  {
    step: 19,
    title: 'Antigravity Agent Executes Approved Action',
    description: 'Agent applies patch: Staging → Patching calculator.py → Running test harness.',
    brainState: 'EXECUTING',
  },
  {
    step: 20,
    title: 'Run Test Matrix (12 Tests)',
    description: 'Pytest suite executed against updated code.',
    brainState: 'VERIFYING',
  },
  {
    step: 21,
    title: 'Gemini 3.8 Flash Verifies Result',
    description: 'AI audits test output and asserts all 12 test assertions pass with zero regressions.',
    brainState: 'VERIFYING',
  },
  {
    step: 22,
    title: '✓ VERIFIED: 12/12 Tests Passed',
    description: 'Task completed! First Sight verified the solution without manual triage.',
    brainState: 'VERIFIED',
  },
];
