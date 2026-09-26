'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalTests?: number;
  passedTests?: number;
  summary?: string;
  analyzedByModel?: string;
}

export function VerificationModal({
  isOpen,
  onClose,
  totalTests = 12,
  passedTests = 12,
  summary = 'All 12/12 tests passed successfully. The division by zero blocker has been completely resolved with zero regressions.',
  analyzedByModel = 'gemini-3.8-flash',
}: VerificationModalProps) {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#3B82F6', '#8B5CF6', '#10B981'],
        });
      } catch (e) {
        // Non-fatal if canvas not supported
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0C101C] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-4">
        {/* Verification Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-in zoom-in-50 duration-300" />
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25">
            ✓ Result Verified
          </span>
          <h3 className="text-xl font-extrabold text-white mt-2 tracking-tight">
            {passedTests}/{totalTests} Tests Passed
          </h3>
          <p className="text-xs text-gray-300 mt-2 leading-relaxed px-4">
            {summary}
          </p>
        </div>

        {/* Verification Metadata Box */}
        <div className="p-3.5 rounded-xl bg-[#080B14] border border-[#1A1F33] text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span>Audit Model:</span>
            <span className="font-mono text-blue-300 font-semibold">{analyzedByModel}</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Test Suite:</span>
            <span className="text-emerald-300 font-medium">pytest 12 assertions</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Regressions:</span>
            <span className="text-emerald-400 font-semibold">0 detected</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-emerald-500/20 transition-all hover:scale-102"
        >
          Continue in Workspace
        </button>
      </div>
    </div>
  );
}
