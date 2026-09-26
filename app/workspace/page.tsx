'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { TaskContextPanel } from '@/components/workspace/TaskContextPanel';
import { WorkspaceEditor } from '@/components/workspace/WorkspaceEditor';
import { TerminalPanel } from '@/components/workspace/TerminalPanel';
import { AIBrain } from '@/components/ai/AIBrain';
import { AIPipelineView } from '@/components/ai/AIPipelineView';
import { AgentActionModal } from '@/components/workspace/AgentActionModal';
import { VerificationModal } from '@/components/workspace/VerificationModal';
import { DemoBar } from '@/components/demo/DemoBar';
import { AIBrainStateType, ProposedAction } from '@/types';
import { DEMO_STEPS } from '@/lib/demo/demo-controller';
import { Sparkles, HelpCircle, X } from 'lucide-react';

export default function WorkspacePage() {
  const [workspace, setWorkspace] = useState<any>(null);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState<string>('calculator.py');

  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [testOutput, setTestOutput] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(0);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const [brainState, setBrainState] = useState<AIBrainStateType>('MONITORING');
  const [currentInsight, setCurrentInsight] = useState<any>(null);

  const [explanationModal, setExplanationModal] = useState<{
    isOpen: boolean;
    explanation?: string;
    rootCause?: string;
    impact?: string;
  }>({ isOpen: false });

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: ProposedAction | null;
  }>({ isOpen: false, action: null });

  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    summary?: string;
  }>({ isOpen: false });

  // Demo controller state
  const [demoStep, setDemoStep] = useState<number>(1);
  const [isDemoPlaying, setIsDemoPlaying] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load workspace data dynamically
  const loadWorkspace = async (overrideSlug?: string) => {
    try {
      let slug = overrideSlug;
      if (!slug && typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        slug = params.get('slug') || localStorage.getItem('active_project_slug') || '';
      }
      const url = slug ? `/api/workspace?slug=${encodeURIComponent(slug)}` : '/api/workspace';
      const res = await fetch(url);
      const data = await res.json();
      if (data.workspace) {
        setWorkspace(data.workspace);
        const wsFiles = data.workspace.files || {};
        setFiles(wsFiles);
        const fileNames = Object.keys(wsFiles);
        const initialActive = data.workspace.activeFile || (fileNames.length > 0 ? fileNames[0] : 'main.py');
        setActiveFile(initialActive);

        // Check if there is an active insight
        if (data.workspace.insights && data.workspace.insights.length > 0) {
          const latest = data.workspace.insights[0];
          if (latest.status === 'NEW' || latest.status === 'ACTIONED') {
            setCurrentInsight(latest);
            setBrainState(latest.status === 'ACTIONED' ? 'ACTION_READY' : 'INSIGHT_DETECTED');
          } else {
            setCurrentInsight(null);
            setBrainState('MONITORING');
          }
        } else {
          setCurrentInsight(null);
          setBrainState('MONITORING');
        }
      }
    } catch (err) {
      console.error('Failed to load workspace:', err);
    }
  };

  useEffect(() => {
    loadWorkspace();
    const handleProjectChanged = (e: any) => {
      if (e.detail?.slug) {
        loadWorkspace(e.detail.slug);
      } else {
        loadWorkspace();
      }
    };
    window.addEventListener('projectChanged', handleProjectChanged);
    return () => {
      window.removeEventListener('projectChanged', handleProjectChanged);
    };
  }, []);

  // Code change in active file
  const handleCodeChange = (newCode: string) => {
    setFiles((prev) => ({
      ...prev,
      [activeFile]: newCode,
    }));
  };

  // Save active file
  const handleSave = async () => {
    if (!workspace) return;
    try {
      await fetch('/api/workspace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          activeFile,
          content: files[activeFile],
        }),
      });
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  };

  // Run Python Code
  const handleRunCode = async () => {
    if (!workspace) return;
    setIsRunning(true);
    try {
      const res = await fetch('/api/workspace/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          filename: activeFile,
          code: files[activeFile],
        }),
      });
      const data = await res.json();
      if (data.runResult) {
        setStdout(data.runResult.stdout || '');
        setStderr(data.runResult.stderr || '');
        setHasError(data.runResult.hasError || false);
        setExecutionTimeMs(data.runResult.executionTimeMs || 45);
      }

      if (data.insight) {
        setCurrentInsight(data.insight);
      }

      if (data.brainState) {
        setBrainState(data.brainState);
      }
    } catch (err) {
      console.error('Failed to run code:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Run Test Suite
  const handleRunTests = async () => {
    if (!workspace) return;
    setIsTesting(true);
    try {
      const codeToTest = files[activeFile] || files['calculator.py'] || Object.values(files)[0] || '';
      const res = await fetch('/api/workspace/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          code: codeToTest,
        }),
      });
      const data = await res.json();
      if (data.testResult) {
        setStdout(data.testResult.stdout || '');
        setStderr(data.testResult.stderr || '');
        setTestOutput(data.testResult.stdout || '');
        setHasError(data.testResult.failed > 0);
        setExecutionTimeMs(50);
      }

      if (data.insight) {
        setCurrentInsight(data.insight);
      }

      if (data.brainState) {
        setBrainState(data.brainState);
      }
    } catch (err) {
      console.error('Failed to run tests:', err);
    } finally {
      setIsTesting(false);
    }
  };

  // User clicks [Explain]
  const handleExplain = async () => {
    if (!workspace) return;
    try {
      const res = await fetch('/api/insights/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          insightId: currentInsight?.id,
        }),
      });
      const data = await res.json();
      if (data.explanation) {
        setExplanationModal({
          isOpen: true,
          explanation: data.explanation.explanation,
          rootCause: data.explanation.rootCause,
          impact: data.explanation.impact,
        });
      }
    } catch (err) {
      console.error('Error fetching explanation:', err);
    }
  };

  // User clicks [Suggest Fix] -> Opens Action Proposal Modal
  const handleSuggestFix = async () => {
    if (!workspace) return;
    try {
      const res = await fetch('/api/agent/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          insightId: currentInsight?.id,
        }),
      });
      const data = await res.json();
      if (data.action) {
        setActionModal({
          isOpen: true,
          action: data.action,
        });
        setBrainState('ACTION_READY');
      }
    } catch (err) {
      console.error('Error proposing fix:', err);
    }
  };

  // User clicks [Ignore]
  const handleIgnore = async () => {
    if (currentInsight) {
      await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insightId: currentInsight.id,
          status: 'DISMISSED',
        }),
      });
    }
    setCurrentInsight(null);
    setBrainState('MONITORING');
  };

  // User clicks [Approve] inside AgentActionModal
  const handleApproveAction = async (actionId: string) => {
    try {
      const res = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId }),
      });
      const data = await res.json();

      if (data.updatedFiles) {
        setFiles(data.updatedFiles);
      }

      if (data.execution) {
        setStdout(data.execution.stdout || '');
        setStderr('');
        setHasError(false);
      }

      setBrainState('VERIFIED');
      setVerificationModal({
        isOpen: true,
        summary: data.verification?.summary,
      });

      // Reload workspace tasks
      loadWorkspace();
    } catch (err) {
      console.error('Error approving action:', err);
    }
  };

  // Reset demo
  const handleResetDemo = async () => {
    setIsDemoPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET' }),
      });
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
      }
      setDemoStep(1);
      setBrainState('MONITORING');
      setCurrentInsight(null);
      setStdout('');
      setStderr('');
      setHasError(false);
      loadWorkspace();
    } catch (err) {
      console.error('Failed to reset demo:', err);
    }
  };

  // Execute demo step
  const executeStep = async (stepNum: number) => {
    const stepDef = DEMO_STEPS.find((s) => s.step === stepNum);
    if (!stepDef) return;

    setDemoStep(stepNum);
    setBrainState(stepDef.brainState as any);

    if (stepDef.terminalOutput) {
      setStdout(stepDef.terminalOutput.stdout);
      setStderr(stepDef.terminalOutput.stderr);
      setHasError(stepDef.terminalOutput.exitCode !== 0);
    }

    if (stepNum === 13) {
      // Surfaced blocker
      setCurrentInsight({
        id: 'blocker-div-zero',
        title: 'Repeated ZeroDivisionError in calculate()',
        summary: 'You have encountered the same division error three times.',
        evidence: 'Failed 3 times during execution on calculate(10, 0, "divide").',
        confidence: 0.94,
        risk: 'LOW',
      });
    }

    if (stepNum === 15) {
      // Show explanation modal
      setExplanationModal({
        isOpen: true,
        explanation: 'In calculator.py, calculate(a, b, operation) directly evaluates "return a / b". When b is 0, Python raises ZeroDivisionError.',
        rootCause: 'Missing denominator zero guard check.',
        impact: 'Crashes runtime on divide operations with zero.',
      });
    }

    if (stepNum === 17) {
      // Action Proposal modal ready
      setActionModal({
        isOpen: true,
        action: {
          id: 'action-fix-div-zero',
          title: 'Add division-by-zero validation to calculator.py',
          description: 'Inject defensive validation to check whether the denominator is 0 before dividing, returning "Error: Division by zero" gracefully.',
          targetFile: 'calculator.py',
          patchDiff: `@@ -10,6 +10,9 @@\n     if operation == "multiply":\n         return a * b\n     if operation == "divide":\n+        # First Sight guard: prevent ZeroDivisionError\n+        if b == 0:\n+            return "Error: Division by zero"\n         return a / b\n     return None`,
          risk: 'LOW',
          status: 'PROPOSED',
        },
      });
    }

    if (stepNum === 19 || stepNum === 20 || stepNum === 21 || stepNum === 22) {
      // Fix code
      const patchedCode = `def calculate(a, b, operation):
    if operation == "add":
        return a + b
    if operation == "subtract":
        return a - b
    if operation == "multiply":
        return a * b
    if operation == "divide":
        # First Sight guard: prevent ZeroDivisionError
        if b == 0:
            return "Error: Division by zero"
        return a / b
    return None

if __name__ == "__main__":
    print("Add: 10 + 5 =", calculate(10, 5, "add"))
    print("Divide: 10 / 2 =", calculate(10, 2, "divide"))
    print("Divide by zero:", calculate(10, 0, "divide"))
`;
      setFiles((prev) => ({ ...prev, 'calculator.py': patchedCode }));

      if (stepNum === 22) {
        setStdout(
          `============================= test session starts ==============================\n` +
          `platform win32 -- Python 3.13.0, pytest-8.3.2\n` +
          `collected 12 items\n\n` +
          `test_add_positive .................................... [ PASSED ]\n` +
          `test_add_negative .................................... [ PASSED ]\n` +
          `test_add_zero ........................................ [ PASSED ]\n` +
          `test_sub_positive .................................... [ PASSED ]\n` +
          `test_sub_negative .................................... [ PASSED ]\n` +
          `test_mul_positive .................................... [ PASSED ]\n` +
          `test_mul_zero ........................................ [ PASSED ]\n` +
          `test_mul_negative .................................... [ PASSED ]\n` +
          `test_div_standard .................................... [ PASSED ]\n` +
          `test_div_negative .................................... [ PASSED ]\n` +
          `test_div_fraction .................................... [ PASSED ]\n` +
          `test_div_zero_handled ................................ [ PASSED ]\n\n` +
          `=========================== 12 passed in 0.05s ===========================`
        );
        setStderr('');
        setHasError(false);
        setBrainState('VERIFIED');
        setVerificationModal({
          isOpen: true,
          summary: 'All 12/12 tests passed successfully. The division by zero blocker has been completely resolved with zero regressions.',
        });
      }
    }
  };

  // Demo next step
  const handleNextStep = () => {
    if (demoStep < DEMO_STEPS.length) {
      executeStep(demoStep + 1);
    }
  };

  // Demo prev step
  const handlePrevStep = () => {
    if (demoStep > 1) {
      executeStep(demoStep - 1);
    }
  };

  // Auto-play toggle
  const handleToggleAutoPlay = () => {
    if (isDemoPlaying) {
      setIsDemoPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsDemoPlaying(true);
    }
  };

  useEffect(() => {
    if (isDemoPlaying) {
      timerRef.current = setInterval(() => {
        setDemoStep((prev) => {
          if (prev >= DEMO_STEPS.length) {
            setIsDemoPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          executeStep(prev + 1);
          return prev + 1;
        });
      }, 2400);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDemoPlaying]);

  return (
    <AppShell brainState={brainState}>

      {/* Main 3-Column Core MVP Screen */}
      <div className="flex-1 p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1720px] mx-auto w-full">
        {/* LEFT COLUMN: Task Context (3 columns on large screens) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <TaskContextPanel
            task={workspace?.tasks?.[0]}
            activeFile={activeFile}
            files={Object.keys(files)}
            focusTimeMinutes={workspace?.focusTimeMinutes || 42}
            onSelectFile={(f) => setActiveFile(f)}
          />
        </div>

        {/* CENTER COLUMN: Code Workspace & Terminal (6 columns on large screens) */}
        <div className="lg:col-span-6 flex flex-col gap-4 min-h-[640px]">
          {/* Top Code Editor */}
          <div className="flex-1 min-h-[380px]">
            <WorkspaceEditor
              files={files}
              activeFile={activeFile}
              onSelectFile={(f) => setActiveFile(f)}
              onCodeChange={handleCodeChange}
              onSave={handleSave}
              onRunCode={handleRunCode}
              onRunTests={handleRunTests}
              onInspectVision={() => {
                window.location.href = '/vision';
              }}
              isRunning={isRunning}
              isTesting={isTesting}
            />
          </div>

          {/* Bottom Terminal Panel */}
          <div className="h-60">
            <TerminalPanel
              stdout={stdout}
              stderr={stderr}
              testOutput={testOutput}
              hasError={hasError}
              executionTimeMs={executionTimeMs}
              onClear={() => {
                setStdout('');
                setStderr('');
                setTestOutput('');
                setHasError(false);
              }}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: AI Brain & Pipeline (3 columns on large screens) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* AI Brain Visual Centerpiece */}
          <AIBrain
            state={brainState}
            currentInsight={currentInsight}
            onExplain={handleExplain}
            onSuggestFix={handleSuggestFix}
            onIgnore={handleIgnore}
            onOpenActions={() => {
              window.location.href = '/agent';
            }}
          />

          {/* AI Pipeline Architecture Viewer */}
          <AIPipelineView activeStage={brainState} />
        </div>
      </div>

      {/* Explanation Modal (No Chain of Thought) */}
      {explanationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0E111E] border border-blue-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E233B]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Gemini 3.8 Flash Analysis</h3>
                  <span className="text-[10px] text-gray-400 font-mono">Concise Blocker Explanation</span>
                </div>
              </div>
              <button
                onClick={() => setExplanationModal({ isOpen: false })}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-300">
              <div className="p-3 rounded-xl bg-[#141728] border border-[#212742]">
                <span className="text-gray-400 uppercase text-[10px] font-bold block mb-1">
                  Root Cause:
                </span>
                <p className="text-gray-200">{explanationModal.rootCause}</p>
              </div>

              <div>
                <span className="text-gray-400 uppercase text-[10px] font-bold block mb-1">
                  Explanation:
                </span>
                <p className="text-gray-300">{explanationModal.explanation}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                <span className="font-bold">Impact: </span>
                {explanationModal.impact}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setExplanationModal({ isOpen: false });
                  handleSuggestFix();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Suggest Fix Action</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Action Proposal Modal */}
      <AgentActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, action: null })}
        action={actionModal.action}
        onApprove={handleApproveAction}
        onReject={() => setActionModal({ isOpen: false, action: null })}
      />

      {/* Verification Success Modal */}
      <VerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ isOpen: false })}
        totalTests={12}
        passedTests={12}
        summary={verificationModal.summary}
      />
    </AppShell>
  );
}
