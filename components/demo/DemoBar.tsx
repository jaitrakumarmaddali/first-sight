'use client';

import React from 'react';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Bot,
} from 'lucide-react';
import { DEMO_STEPS } from '@/lib/demo/demo-controller';

interface DemoBarProps {
  currentStep: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onJumpToStep: (step: number) => void;
  onReset: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function DemoBar({
  currentStep,
  isPlaying,
  onTogglePlay,
  onNextStep,
  onPrevStep,
  onJumpToStep,
  onReset,
}: DemoBarProps) {
  const stepInfo = DEMO_STEPS.find((s) => s.step === currentStep) || DEMO_STEPS[0];
  const progressPercent = Math.round((currentStep / DEMO_STEPS.length) * 100);

  return (
    <div className="bg-[#0B0D18]/95 backdrop-blur border-b border-[#232842] px-4 py-2 text-xs shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Demo Indicator & Step Details */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono text-[11px] font-bold shrink-0">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>DEMO MODE</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-xs truncate">
                Step {stepInfo.step}/{DEMO_STEPS.length}: {stepInfo.title}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1B2035] text-gray-400 border border-[#2B3150] hidden sm:inline">
                {stepInfo.brainState}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              {stepInfo.description}
            </p>
          </div>
        </div>

        {/* Progress Bar & Key Milestone Badges */}
        <div className="hidden lg:flex items-center gap-2 w-64">
          <div className="w-full h-1.5 rounded-full bg-[#181D33] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-gray-400 font-mono shrink-0">
            {progressPercent}%
          </span>
        </div>

        {/* Center / Right: Step Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Quick jump milestone triggers */}
          <div className="hidden xl:flex items-center gap-1 text-[10px] font-mono mr-2">
            <button
              onClick={() => onJumpToStep(8)}
              className={`px-2 py-0.5 rounded border transition-colors ${
                currentStep >= 8 && currentStep < 13
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#121526] text-gray-400 border-[#222740] hover:text-gray-200'
              }`}
            >
              Failures
            </button>
            <button
              onClick={() => onJumpToStep(13)}
              className={`px-2 py-0.5 rounded border transition-colors ${
                currentStep >= 13 && currentStep < 18
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#121526] text-gray-400 border-[#222740] hover:text-gray-200'
              }`}
            >
              Blocker
            </button>
            <button
              onClick={() => onJumpToStep(18)}
              className={`px-2 py-0.5 rounded border transition-colors ${
                currentStep >= 18
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#121526] text-gray-400 border-[#222740] hover:text-gray-200'
              }`}
            >
              Approve
            </button>
          </div>

          <button
            onClick={onPrevStep}
            disabled={currentStep <= 1}
            className="p-1.5 rounded-lg bg-[#141829] border border-[#232842] text-gray-300 hover:text-white disabled:opacity-40"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              isPlaying
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Auto-Play</span>
              </>
            )}
          </button>

          <button
            onClick={onNextStep}
            disabled={currentStep >= DEMO_STEPS.length}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141829] border border-[#232842] text-xs font-medium text-gray-200 hover:text-white hover:border-[#353B60] transition-colors disabled:opacity-40"
            title="Next Step"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-[#141829] border border-[#232842] text-gray-400 hover:text-white transition-colors"
            title="Reset Demo to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
