'use client';

import React from 'react';
import {
  Brain,
  Eye,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Wrench,
  HelpCircle,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AIBrainStateType } from '@/types';

interface AIBrainProps {
  state: AIBrainStateType;
  currentInsight?: {
    id: string;
    title: string;
    summary: string;
    evidence?: string;
    confidence: number;
    risk?: string;
  } | null;
  onExplain?: () => void;
  onSuggestFix?: () => void;
  onIgnore?: () => void;
  onOpenActions?: () => void;
}

export function AIBrain({
  state,
  currentInsight,
  onExplain,
  onSuggestFix,
  onIgnore,
  onOpenActions,
}: AIBrainProps) {
  // Render neural brain status ring and details
  const getBrainVisuals = () => {
    switch (state) {
      case 'REASONING':
        return {
          label: 'REASONING',
          subtext: 'Gemini 3.8 Flash analyzing workspace context...',
          color: 'from-violet-500 to-indigo-600',
          glow: 'glow-violet',
          badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
          icon: Brain,
          pulse: true,
        };
      case 'INSIGHT_DETECTED':
        return {
          label: 'INSIGHT DETECTED',
          subtext: 'Possible blocker identified before you asked',
          color: 'from-amber-500 to-orange-600',
          glow: 'glow-amber',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          icon: AlertTriangle,
          pulse: true,
        };
      case 'ACTION_READY':
        return {
          label: 'ACTION READY',
          subtext: 'Antigravity Agent proposal awaiting your sanction',
          color: 'from-blue-500 to-cyan-500',
          glow: 'glow-blue',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: Wrench,
          pulse: false,
        };
      case 'EXECUTING':
        return {
          label: 'EXECUTING',
          subtext: 'Antigravity Agent applying approved changes...',
          color: 'from-blue-600 to-violet-600',
          glow: 'glow-blue',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: Sparkles,
          pulse: true,
        };
      case 'VERIFYING':
        return {
          label: 'VERIFYING',
          subtext: 'Running test matrix & Gemini verification audit...',
          color: 'from-indigo-500 to-teal-500',
          glow: 'glow-blue',
          badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          icon: ShieldCheck,
          pulse: true,
        };
      case 'VERIFIED':
        return {
          label: 'VERIFIED',
          subtext: '12/12 tests passed with zero regressions',
          color: 'from-emerald-500 to-green-600',
          glow: 'glow-green',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: CheckCircle2,
          pulse: false,
        };
      case 'MONITORING':
      default:
        return {
          label: 'MONITORING',
          subtext: 'Watching your workspace in real time...',
          color: 'from-blue-600 to-cyan-600',
          glow: 'glow-blue',
          badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
          icon: Eye,
          pulse: false,
        };
    }
  };

  const visuals = getBrainVisuals();
  const IconComponent = visuals.icon;

  return (
    <div className="bg-[#0D101C] border border-[#21263E] rounded-xl p-4 flex flex-col gap-4 shadow-xl">
      {/* Top Brain Status Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${visuals.color} flex items-center justify-center shadow-lg ${visuals.glow} transition-all duration-300`}
          >
            <IconComponent className={`w-5 h-5 text-white ${visuals.pulse ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${visuals.badgeBg}`}>
                {visuals.label}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">{visuals.subtext}</p>
          </div>
        </div>
      </div>

      {/* When Blocker / Insight is Active */}
      {currentInsight && (state === 'INSIGHT_DETECTED' || state === 'ACTION_READY') && (
        <div className="p-3.5 rounded-lg bg-[#14121F] border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <h4 className="text-xs font-bold text-amber-200 tracking-tight">
                {currentInsight.title}
              </h4>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {Math.round(currentInsight.confidence * 100)}% Confidence
            </span>
          </div>

          <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
            {currentInsight.summary}
          </p>

          {currentInsight.evidence && (
            <div className="p-2 rounded bg-[#0A0C16] border border-[#232742] text-[10px] text-gray-400 font-mono">
              <span className="text-gray-400 uppercase font-semibold">Evidence: </span>
              {currentInsight.evidence}
            </div>
          )}

          {/* Action Buttons: Explain, Suggest Fix, Ignore */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {onExplain && (
              <button
                onClick={onExplain}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C2138] border border-[#2E365C] hover:border-blue-500/60 hover:text-white text-xs font-medium text-gray-200 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Explain</span>
              </button>
            )}

            {onSuggestFix && (
              <button
                onClick={onSuggestFix}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Suggest Fix</span>
              </button>
            )}

            {onIgnore && (
              <button
                onClick={onIgnore}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-[#1A1F36] transition-colors ml-auto"
              >
                Ignore
              </button>
            )}
          </div>
        </div>
      )}

      {/* When Verified */}
      {state === 'VERIFIED' && (
        <div className="p-3.5 rounded-lg bg-[#0A1A12] border border-emerald-500/40 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-emerald-200">Verification Passed</h4>
          </div>
          <p className="text-[11px] text-gray-300">
            All 12 unit tests passed. Division by zero safety guard verified by Gemini 3.8 Flash.
          </p>
        </div>
      )}

      {/* Active Pipeline Preview Footer */}
      <div className="pt-2 border-t border-[#1C2036] flex items-center justify-between text-[10px] text-gray-400 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          Pipeline: Gemma → Flash → Agent
        </span>
        <span className="text-gray-400">Autonomous Observer</span>
      </div>
    </div>
  );
}
