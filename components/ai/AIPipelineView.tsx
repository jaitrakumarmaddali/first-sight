'use client';

import React from 'react';
import { ArrowDown, Cpu, Sparkles, ShieldAlert, Bot, CheckCircle2 } from 'lucide-react';
import { AIBrainStateType } from '@/types';

interface AIPipelineViewProps {
  activeStage?: AIBrainStateType;
}

export function AIPipelineView({ activeStage = 'MONITORING' }: AIPipelineViewProps) {
  const stages = [
    {
      id: 'activity',
      title: 'RAW WORKSPACE ACTIVITY',
      desc: 'Keystrokes, file changes, terminal executions, test results',
      icon: Cpu,
      active: true,
      color: 'border-blue-500/40 text-blue-300 bg-blue-500/5',
    },
    {
      id: 'gemma',
      title: 'GEMMA 4 (E2B / E4B)',
      desc: 'Lightweight Edge SLM filtering noise & detecting repeated failure patterns',
      icon: Sparkles,
      active: true,
      color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/5',
    },
    {
      id: 'flash-reasoning',
      title: 'GEMINI 3.8 FLASH',
      desc: 'Deep multi-step reasoning, root cause analysis & blocker synthesis',
      icon: ShieldAlert,
      active: activeStage === 'REASONING' || activeStage === 'INSIGHT_DETECTED' || activeStage === 'ACTION_READY',
      color: 'border-violet-500/40 text-violet-300 bg-violet-500/5',
    },
    {
      id: 'insight',
      title: 'PROACTIVE AI INSIGHT',
      desc: 'Non-intrusive blocker notification surfaced before developer asks',
      icon: Sparkles,
      active: activeStage === 'INSIGHT_DETECTED' || activeStage === 'ACTION_READY',
      color: 'border-amber-500/40 text-amber-300 bg-amber-500/5',
    },
    {
      id: 'agent',
      title: 'ANTIGRAVITY AGENT',
      desc: 'Approved workspace action execution with safety boundaries',
      icon: Bot,
      active: activeStage === 'EXECUTING',
      color: 'border-blue-500/40 text-blue-300 bg-blue-500/5',
    },
    {
      id: 'verification',
      title: 'GEMINI 3.8 FLASH VERIFICATION',
      desc: 'Post-execution audit asserting test matrix passes with zero regressions',
      icon: CheckCircle2,
      active: activeStage === 'VERIFYING' || activeStage === 'VERIFIED',
      color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/5',
    },
  ];

  return (
    <div className="bg-[#0B0D17] border border-[#1F2338] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#1A1E30]">
        <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>AI Architecture Pipeline</span>
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Google AI Stack
        </span>
      </div>

      <div className="space-y-2">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <React.Fragment key={stage.id}>
              <div
                className={`p-2.5 rounded-lg border text-xs transition-all ${
                  stage.active
                    ? `${stage.color} shadow-sm`
                    : 'border-[#1C2033] bg-[#0E101D] text-gray-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{stage.title}</span>
                  </div>
                  {stage.active && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              {idx < stages.length - 1 && (
                <div className="flex justify-center my-0.5">
                  <ArrowDown className="w-3.5 h-3.5 text-gray-600" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
