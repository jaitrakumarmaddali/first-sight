'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import {
  CheckSquare,
  Clock,
  Lightbulb,
  Bot,
  TrendingUp,
  Brain,
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const slug = typeof window !== 'undefined' ? localStorage.getItem('active_project_slug') : null;
        const wsUrl = slug ? `/api/workspace?slug=${encodeURIComponent(slug)}` : '/api/workspace';
        const [wsRes, actRes, insRes, agRes] = await Promise.all([
          fetch(wsUrl),
          fetch('/api/activity?limit=6'),
          fetch('/api/insights'),
          fetch('/api/agent'),
        ]);

        const ws = await wsRes.json();
        const act = await actRes.json();
        const ins = await insRes.json();
        const ag = await agRes.json();

        setData({
          workspace: ws.workspace,
          activities: act.events || [],
          insights: ins.insights || [],
          actions: ag.actions || [],
        });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const task = data?.workspace?.tasks?.[0] || {
    title: data?.workspace?.name ? `Configure ${data.workspace.name}` : 'Create Your First Task',
    progress: data?.workspace?.tasks?.[0]?.progress || 0,
    status: 'IN_PROGRESS',
  };

  const focusTime = data?.workspace?.focusTimeMinutes || 25;
  const insightsCount = data?.insights?.length || 0;
  const actionsCount = data?.actions?.length || 0;

  return (
    <AppShell>
      <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Dashboard Title & Tagline Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2338] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                Autonomous Command Center
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                Live Overview
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1 tracking-tight">
              {data?.workspace?.name || 'First Sight Dashboard'}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              &quot;AI that sees what you&apos;re working on and helps before you ask.&quot;
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/workspace"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-102"
            >
              <span>Open Code Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4 Core Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: CURRENT TASK */}
          <div className="p-5 rounded-2xl bg-[#0D101C] border border-[#212740] shadow-xl space-y-3">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Current Task
              </span>
              <CheckSquare className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white truncate">{task.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 rounded-full bg-[#1A1F33] overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {task.progress}%
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 font-mono">In Progress • High Priority</p>
          </div>

          {/* Card 2: FOCUS TIME */}
          <div className="p-5 rounded-2xl bg-[#0D101C] border border-[#212740] shadow-xl space-y-3">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Focus Time
              </span>
              <Clock className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white">{focusTime} min</h3>
              <p className="text-xs text-gray-400 mt-1">Continuous active session</p>
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Optimal flow state detected</span>
            </p>
          </div>

          {/* Card 3: AI INSIGHTS */}
          <div className="p-5 rounded-2xl bg-[#0D101C] border border-[#212740] shadow-xl space-y-3">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                AI Insights
              </span>
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white">{insightsCount} active</h3>
              <p className="text-xs text-gray-400 mt-1">Autonomous blocker catches</p>
            </div>
            <p className="text-[11px] text-amber-300 font-mono">
              {insightsCount > 0 ? `${insightsCount} blocker(s) detected` : 'No unresolved blockers'}
            </p>
          </div>

          {/* Card 4: AGENT ACTIONS */}
          <div className="p-5 rounded-2xl bg-[#0D101C] border border-[#212740] shadow-xl space-y-3">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Agent Actions
              </span>
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white">{actionsCount} verified</h3>
              <p className="text-xs text-gray-400 mt-1">Sanctioned & executed safely</p>
            </div>
            <p className="text-[11px] text-emerald-400 font-mono">
              0 Unverified mutations
            </p>
          </div>
        </div>

        {/* 3 Answering Columns: What am I doing? What has AI noticed? What needs attention? */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question 1: What am I doing? */}
          <div className="p-6 rounded-2xl bg-[#0B0D18] border border-[#1E2338] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1F33] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-400" />
                <span>What am I doing?</span>
              </h3>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                Active Project
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-bold text-white">{data?.workspace?.name || task.title}</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {data?.workspace?.description || 'Active project module with live execution and automated testing.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#111424] border border-[#222740] text-xs space-y-2">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Active File:</span>
                  <span className="text-blue-300 font-semibold font-mono">{data?.workspace?.activeFile || 'main.py'}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Engine:</span>
                  <span className="text-emerald-400 font-mono font-bold">Python 3.13 Runtime</span>
                </div>
              </div>

              <Link
                href="/workspace"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold pt-1"
              >
                <span>Jump into code editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Question 2: What has AI noticed? */}
          <div className="p-6 rounded-2xl bg-[#0B0D18] border border-[#1E2338] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1F33] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" />
                <span>What has AI noticed?</span>
              </h3>
              <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                Gemma + Gemini
              </span>
            </div>

            <div className="space-y-3">
              {data?.insights?.[0] ? (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{data.insights[0].title}</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      {Math.round((data.insights[0].confidence || 0.95) * 100)}% Confidence
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    {data.insights[0].summary}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#111424] border border-[#222740] text-xs text-gray-400">
                  <span className="text-emerald-400 font-semibold block mb-1">✓ No Blockers Detected</span>
                  First Sight is continuously observing terminal runs and file changes.
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#111424] border border-[#222740] text-xs space-y-2">
                <div className="flex items-center justify-between text-gray-400 text-[11px]">
                  <span>Activity Classifier:</span>
                  <span className="text-gray-200 font-mono">Gemma 4 Edge SLM</span>
                </div>
                <div className="flex items-center justify-between text-gray-400 text-[11px]">
                  <span>Reasoning Engine:</span>
                  <span className="text-gray-200 font-mono">Google Gemini AI</span>
                </div>
              </div>

              <Link
                href="/insights"
                className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold pt-1"
              >
                <span>View all AI insights</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Question 3: What needs my attention? */}
          <div className="p-6 rounded-2xl bg-[#0B0D18] border border-[#1E2338] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1F33] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>What needs my attention?</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Approval Required
              </span>
            </div>

            <div className="space-y-3">
              {data?.actions?.[0] ? (
                <div className="p-3.5 rounded-xl bg-[#111426] border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-blue-200">
                      {data.actions[0].title}
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400">{data.actions[0].risk || 'Low Risk'}</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    {data.actions[0].description}
                  </p>
                  <Link
                    href="/agent"
                    className="block text-center w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors"
                  >
                    Review & Approve
                  </Link>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#111424] border border-[#222740] text-xs text-gray-400">
                  <span className="text-blue-400 font-semibold block mb-1">No Pending Approvals</span>
                  When the AI detects repeated errors, proposed fixes will appear here for your explicit authorization.
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Strict user approval policy enforced.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline Preview */}
        <div className="p-6 rounded-2xl bg-[#0B0D18] border border-[#1E2338] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1A1F33] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Recent Activity Feed</span>
            </h3>
            <Link
              href="/activity"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              View Full Timeline &rarr;
            </Link>
          </div>

          <div className="divide-y divide-[#171B2D]">
            {data?.activities?.length > 0 ? (
              data.activities.slice(0, 4).map((act: any) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="font-semibold text-gray-200">{act.eventType}</span>
                    <span className="text-gray-400 hidden sm:inline">{act.description}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-gray-500">
                    {act.gemmaClass && (
                      <span className="px-1.5 py-0.2 rounded bg-[#131627] text-gray-400 border border-[#21263E]">
                        {act.gemmaClass}
                      </span>
                    )}
                    <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-xs text-gray-500 text-center font-mono">
                No activity yet. Run code in the workspace to start the feed.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
