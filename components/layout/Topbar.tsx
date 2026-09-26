'use client';

import React from 'react';
import {
  Bell,
  Search,
  Pause,
  Play,
  PlayCircle,
  Menu,
  ChevronDown,
  Brain,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { AIBrainStateType } from '@/types';

interface TopbarProps {
  brainState?: AIBrainStateType;
  aiMonitoring?: boolean;
  onToggleMonitoring?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleNotifications?: () => void;
  onToggleMobileMenu?: () => void;
  onStartDemo?: () => void;
  unreadNotificationsCount?: number;
}

export function Topbar({
  brainState = 'MONITORING',
  aiMonitoring = true,
  onToggleMonitoring,
  onOpenCommandPalette,
  onToggleNotifications,
  onToggleMobileMenu,
  onStartDemo,
  unreadNotificationsCount = 1,
}: TopbarProps) {
  // Determine badge style based on brainState
  const getBrainStatusBadge = () => {
    switch (brainState) {
      case 'REASONING':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-medium animate-pulse">
            <Brain className="w-3.5 h-3.5 text-violet-400" />
            <span>Reasoning</span>
          </div>
        );
      case 'INSIGHT_DETECTED':
      case 'ACTION_READY':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold glow-amber">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Blocker Detected</span>
          </div>
        );
      case 'VERIFIED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium glow-green">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              {aiMonitoring && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>{aiMonitoring ? 'Monitoring' : 'Paused'}</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-[#0A0C14]/90 backdrop-blur border-b border-[#1E2235] px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu & Current Workspace */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#161928] lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111422] border border-[#232742] text-xs font-medium text-gray-200">
          <span className="text-gray-400">Workspace:</span>
          <span className="font-semibold text-white">Python Calculator</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>

        {/* AI Status Badge */}
        <div className="hidden sm:block">{getBrainStatusBadge()}</div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Quick Start Demo Button */}
        {onStartDemo && (
          <button
            onClick={onStartDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-102 active:scale-98"
          >
            <PlayCircle className="w-4 h-4 text-white" />
            <span>Start Demo</span>
          </button>
        )}

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111422] border border-[#232742] text-xs text-gray-400 hover:text-gray-200 hover:border-[#353B60] transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search or command...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#1B1F34] border border-[#2C3252] text-[10px] font-mono text-gray-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Pause / Resume AI */}
        {onToggleMonitoring && (
          <button
            onClick={onToggleMonitoring}
            title={aiMonitoring ? 'Pause AI Monitoring' : 'Resume AI Monitoring'}
            className="p-2 rounded-lg bg-[#111422] border border-[#232742] text-gray-400 hover:text-white hover:border-[#353B60] transition-colors"
          >
            {aiMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 rounded-lg bg-[#111422] border border-[#232742] text-gray-400 hover:text-white hover:border-[#353B60] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          )}
        </button>
      </div>
    </header>
  );
}
