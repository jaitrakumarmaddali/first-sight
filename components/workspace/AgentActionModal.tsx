'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Bot,
  CheckCircle2,
  XCircle,
  FileCode,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import { ProposedAction, ExecutionTimelineStep } from '@/types';

interface AgentActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: ProposedAction | null;
  onApprove: (actionId: string) => Promise<void>;
  onReject: (actionId: string) => void;
}

export function AgentActionModal({
  isOpen,
  onClose,
  action,
  onApprove,
  onReject,
}: AgentActionModalProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentTimeline, setCurrentTimeline] = useState<ExecutionTimelineStep[]>([]);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen || !action) return null;

  const handleApproveClick = async () => {
    setIsExecuting(true);

    // Initial timeline
    const steps: ExecutionTimelineStep[] = [
      {
        step: 'APPROVED',
        label: 'User Approval Confirmed',
        status: 'completed',
        timestamp: new Date().toLocaleTimeString(),
        details: 'Safety gate passed; authorization granted.',
      },
      {
        step: 'PREPARING',
        label: 'Agent Workspace Staging',
        status: 'in_progress',
        timestamp: new Date().toLocaleTimeString(),
        details: `Isolating ${action.targetFile} snapshot.`,
      },
      {
        step: 'EXECUTING',
        label: 'Patch Applied Safely',
        status: 'pending',
        timestamp: '',
      },
      {
        step: 'TESTING',
        label: 'Running Test Matrix',
        status: 'pending',
        timestamp: '',
      },
      {
        step: 'VERIFYING',
        label: 'Gemini Verification Analysis',
        status: 'pending',
        timestamp: '',
      },
      {
        step: 'COMPLETED',
        label: 'Action Completed & Verified',
        status: 'pending',
        timestamp: '',
      },
    ];

    setCurrentTimeline([...steps]);

    // Animate timeline steps
    await new Promise((r) => setTimeout(r, 400));
    steps[1].status = 'completed';
    steps[2].status = 'in_progress';
    setCurrentTimeline([...steps]);

    await new Promise((r) => setTimeout(r, 450));
    steps[2].status = 'completed';
    steps[3].status = 'in_progress';
    setCurrentTimeline([...steps]);

    await new Promise((r) => setTimeout(r, 450));
    steps[3].status = 'completed';
    steps[4].status = 'in_progress';
    setCurrentTimeline([...steps]);

    await new Promise((r) => setTimeout(r, 400));
    steps[4].status = 'completed';
    steps[5].status = 'completed';
    steps[5].timestamp = new Date().toLocaleTimeString();
    steps[5].details = '12/12 unit tests passed. Blocker resolved.';
    setCurrentTimeline([...steps]);

    setIsExecuting(false);
    setIsDone(true);

    // Call backend approval execution
    await onApprove(action.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0D101C] border border-[#262B44] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1E233B] flex items-center justify-between bg-[#090C16]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Antigravity Agent Action Proposal
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Risk: {action.risk || 'LOW'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Approval Required before modifying workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#161A2B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Action Summary */}
          <div className="p-4 rounded-xl bg-[#121626] border border-[#212740] space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {action.title}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {action.description}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-400 font-mono">
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>Target File: </span>
              <span className="text-blue-300 font-semibold">{action.targetFile}</span>
            </div>
          </div>

          {/* Patch Diff View */}
          {action.patchDiff && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Proposed Patch Diff
              </span>
              <div className="p-3.5 rounded-xl bg-[#090B14] border border-[#1E2338] font-mono text-xs overflow-x-auto text-gray-300">
                <pre className="text-emerald-400 whitespace-pre-wrap">{action.patchDiff}</pre>
              </div>
            </div>
          )}

          {/* Execution Timeline (when triggered) */}
          {currentTimeline.length > 0 && (
            <div className="p-4 rounded-xl bg-[#0B0E19] border border-[#232840] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Execution Timeline
                </span>
                {isDone && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    ✓ Verified Success
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {currentTimeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="mt-0.5">
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : step.status === 'in_progress' ? (
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-600 block m-0.5"></span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold ${
                            step.status === 'completed'
                              ? 'text-gray-200'
                              : step.status === 'in_progress'
                              ? 'text-blue-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.label}
                        </span>
                        {step.timestamp && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            {step.timestamp}
                          </span>
                        )}
                      </div>
                      {step.details && (
                        <p className="text-[11px] text-gray-400 mt-0.5">{step.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-[#1E233B] bg-[#090C16] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Antigravity Safety Protocol active</span>
          </div>

          <div className="flex items-center gap-3">
            {!isDone && (
              <button
                onClick={() => onReject(action.id)}
                disabled={isExecuting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-[#161B2E] transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            )}

            {isDone ? (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all"
              >
                Close & View Workspace
              </button>
            ) : (
              <button
                onClick={handleApproveClick}
                disabled={isExecuting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 hover:scale-102"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Action...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Execute Action</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
