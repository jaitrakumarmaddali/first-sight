'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import {
  Bot,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileCode,
  Sparkles,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { AgentActionModal } from '@/components/workspace/AgentActionModal';

export default function AgentPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const router = useRouter();

  const loadActions = async () => {
    try {
      const res = await fetch('/api/agent');
      const data = await res.json();
      setActions(data.actions || []);
    } catch (err) {
      console.error('Failed to load agent actions:', err);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  const handleApprove = async (actionId: string) => {
    try {
      await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId }),
      });
      loadActions();
    } catch (err) {
      console.error('Failed to approve action:', err);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2338] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                Action Layer
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Safety Boundary Active
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
              Antigravity Agent Actions
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Every action requires explicit user authorization before applying any changes to the workspace.
            </p>
          </div>
        </div>

        {/* Security / Principle Banner */}
        <div className="p-4 rounded-xl bg-[#0F1424] border border-blue-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Controlled Action Protocol
              </h4>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                Antigravity Agent prepares concrete, reviewable code diffs. Risky actions are never performed autonomously.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#182038] text-blue-300 shrink-0 hidden sm:inline">
            Zero File Tampering
          </span>
        </div>

        {/* Actions History List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Proposed & Executed Actions
          </h3>

          {actions.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500 bg-[#0B0D18] rounded-2xl border border-[#1E2338]">
              No actions proposed yet. Actions appear when blockers are detected and you click "Suggest Fix".
            </div>
          ) : (
            actions.map((act) => {
              const isProposed = act.status === 'PROPOSED';
              const isApproved = act.status === 'APPROVED' || act.status === 'EXECUTED';

              return (
                <div
                  key={act.id}
                  className="p-5 rounded-2xl bg-[#0C0E1A] border border-[#212740] shadow-xl space-y-4 hover:border-[#2C3454] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{act.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400 font-mono">
                          <FileCode className="w-3.5 h-3.5 text-blue-400" />
                          <span>Target: {act.targetFile}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">Risk: {act.risk}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                          isProposed
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {act.description}
                  </p>

                  {/* Patch Preview */}
                  {act.patchDiff && (
                    <div className="p-3 rounded-xl bg-[#070912] border border-[#191E32] font-mono text-xs overflow-x-auto text-emerald-400">
                      <pre className="whitespace-pre-wrap">{act.patchDiff}</pre>
                    </div>
                  )}

                  {/* Execution Timeline if executed */}
                  {act.executions && act.executions.length > 0 && (
                    <div className="pt-2 border-t border-[#171A2B] flex items-center justify-between text-xs text-gray-400 font-mono">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Execution verified by Gemini 3.8 Flash</span>
                      </span>
                      <span>Time: {act.executions[0].executionTime}ms</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isProposed && (
                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedAction(act)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all"
                      >
                        <span>Review & Sanction</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal */}
        {selectedAction && (
          <AgentActionModal
            isOpen={Boolean(selectedAction)}
            onClose={() => setSelectedAction(null)}
            action={selectedAction}
            onApprove={async (id) => {
              await handleApprove(id);
              setSelectedAction(null);
            }}
            onReject={() => setSelectedAction(null)}
          />
        )}
      </div>
    </AppShell>
  );
}
