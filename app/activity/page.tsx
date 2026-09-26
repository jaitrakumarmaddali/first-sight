'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  Activity,
  FileCode,
  CheckCircle2,
  AlertOctagon,
  Bot,
  Brain,
  Filter,
  Sparkles,
} from 'lucide-react';

export default function ActivityPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadActivities = async (category: string) => {
    try {
      const url = category === 'ALL' ? '/api/activity' : `/api/activity?category=${category}`;
      const res = await fetch(url);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(filter);
  }, [filter]);

  const categories = ['ALL', 'FILES', 'TESTS', 'AI', 'AGENT', 'ERRORS'];

  const getEventIcon = (cat: string, type: string) => {
    if (cat === 'ERRORS' || type === 'TEST_FAILED') {
      return <AlertOctagon className="w-4 h-4 text-red-400" />;
    }
    if (cat === 'TESTS' || type === 'TEST_PASSED' || type === 'VERIFICATION_COMPLETED') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
    if (cat === 'AI' || type === 'AI_INSIGHT' || type === 'AI_ANALYSIS') {
      return <Brain className="w-4 h-4 text-violet-400" />;
    }
    if (cat === 'AGENT' || type.startsWith('ACTION_')) {
      return <Bot className="w-4 h-4 text-blue-400" />;
    }
    return <FileCode className="w-4 h-4 text-gray-400" />;
  };

  return (
    <AppShell>
      <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2338] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                Event Auditing
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                Gemma Filtered
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
              Activity Stream
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Deterministic event log categorized and noise-filtered by Gemma 4 Edge model.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-[#0E111E] border border-[#20253B]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors ${
                  filter === cat
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline View */}
        <div className="p-6 rounded-2xl bg-[#0B0D18] border border-[#1E2338] shadow-xl">
          {events.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">
              No activity recorded matching filter "{filter}".
            </div>
          ) : (
            <div className="relative border-l border-[#1D2238] ml-4 pl-6 space-y-6">
              {events.map((evt) => {
                const icon = getEventIcon(evt.category, evt.eventType);
                const date = new Date(evt.timestamp);
                const timeString = date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div key={evt.id} className="relative group">
                    {/* Timeline Node dot */}
                    <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-[#121526] border border-[#252B44] flex items-center justify-center group-hover:border-blue-500/60 transition-colors shadow">
                      {icon}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0E1120] border border-[#1C2138] hover:border-[#2B3254] transition-colors space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-200 font-mono">
                            {evt.eventType}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#171B2F] text-gray-400 border border-[#232947]">
                            {evt.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px] text-gray-500">
                          {evt.gemmaClass && (
                            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {evt.gemmaClass}
                            </span>
                          )}
                          <span>{timeString}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed font-sans pt-0.5">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
