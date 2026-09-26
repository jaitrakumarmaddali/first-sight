'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import {
  Lightbulb,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Wrench,
  X,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'BLOCKERS' | 'SUGGESTIONS' | 'PATTERNS' | 'RESOLVED'>('BLOCKERS');
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const router = useRouter();

  const loadInsights = async () => {
    try {
      const res = await fetch('/api/insights');
      const data = await res.json();
      setInsights(data.insights || []);
    } catch (err) {
      console.error('Failed to load insights:', err);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const handleSuggestFix = async (insightId: string) => {
    try {
      let slug = '';
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        slug = params.get('slug') || localStorage.getItem('active_project_slug') || '';
      }
      const wsUrl = slug ? `/api/workspace?slug=${encodeURIComponent(slug)}` : '/api/workspace';
      const wsRes = await fetch(wsUrl);
      const wsData = await wsRes.json();
      if (wsData.workspace) {
        await fetch('/api/agent/propose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId: wsData.workspace.id,
            insightId,
          }),
        });
        router.push('/agent');
      }
    } catch (err) {
      console.error('Failed to propose fix:', err);
    }
  };

  const handleDismiss = async (insightId: string) => {
    try {
      await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insightId,
          status: 'DISMISSED',
        }),
      });
      loadInsights();
    } catch (err) {
      console.error('Failed to dismiss insight:', err);
    }
  };

  // Group insights by section
  const blockers = insights.filter((i) => i.insightType === 'POSSIBLE_BLOCKER' && i.status !== 'DISMISSED');
  const suggestions = insights.filter((i) => i.insightType === 'SUGGESTION');
  const patterns = insights.filter((i) => i.insightType === 'PATTERN');
  const resolved = insights.filter((i) => i.status === 'ACTIONED' || i.insightType === 'RESOLVED');

  const getFilteredList = () => {
    switch (activeTab) {
      case 'BLOCKERS':
        return blockers;
      case 'SUGGESTIONS':
        return suggestions;
      case 'PATTERNS':
        return patterns;
      case 'RESOLVED':
        return resolved;
      default:
        return blockers;
    }
  };

  const currentList = getFilteredList();

  return (
    <AppShell>
      <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2338] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-violet-400 font-semibold">
                Reasoning Intelligence
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
              AI Insights & Blockers
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              First Sight notices recurring issues and surfaces actionable suggestions before you ask.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#1B1F33] pb-2">
          <button
            onClick={() => setActiveTab('BLOCKERS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'BLOCKERS'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Possible Blockers ({blockers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SUGGESTIONS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'SUGGESTIONS'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Suggestions ({suggestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PATTERNS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'PATTERNS'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-violet-400" />
            <span>Patterns ({patterns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'RESOLVED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resolved ({resolved.length})</span>
          </button>
        </div>

        {/* Insight Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.length === 0 ? (
            <div className="md:col-span-2 p-12 text-center text-xs text-gray-500 bg-[#0B0D18] rounded-2xl border border-[#1E2338]">
              No items in this section right now.
            </div>
          ) : (
            currentList.map((ins) => (
              <div
                key={ins.id}
                className="p-5 rounded-2xl bg-[#0C0E1B] border border-[#212740] shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                        ins.insightType === 'POSSIBLE_BLOCKER'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {ins.insightType.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-gray-400 font-semibold">
                      {Math.round(ins.confidence * 100)}% Confidence
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {ins.title}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {ins.summary}
                  </p>

                  {ins.evidence && (
                    <div className="p-2.5 rounded-lg bg-[#080A14] border border-[#1B2034] text-[11px] text-gray-400 font-mono">
                      <span className="text-gray-500 uppercase font-semibold">Observed Evidence: </span>
                      {ins.evidence}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#181D30]">
                  <button
                    onClick={() => router.push('/workspace')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141829] border border-[#232842] text-xs font-medium text-gray-300 hover:text-white"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Explain</span>
                  </button>

                  <button
                    onClick={() => handleSuggestFix(ins.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Suggest Fix</span>
                  </button>

                  <button
                    onClick={() => handleDismiss(ins.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 ml-auto"
                    title="Dismiss Insight"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
