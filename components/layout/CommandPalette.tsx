'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Code2,
  LayoutDashboard,
  CheckSquare,
  Lightbulb,
  Bot,
  Mic,
  Eye,
  Settings,
  PlayCircle,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDemo?: () => void;
  onResetDemo?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onStartDemo,
  onResetDemo,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered by parent state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'demo',
      label: 'Start Interactive Demo (22-Step Workflow)',
      category: 'Actions',
      icon: PlayCircle,
      action: () => {
        onClose();
        if (onStartDemo) onStartDemo();
      },
    },
    {
      id: 'reset',
      label: 'Reset Workspace to Initial State',
      category: 'Actions',
      icon: RotateCcw,
      action: () => {
        onClose();
        if (onResetDemo) onResetDemo();
      },
    },
    {
      id: 'workspace',
      label: 'Go to Code Workspace',
      category: 'Navigation',
      icon: Code2,
      action: () => {
        router.push('/workspace');
        onClose();
      },
    },
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => {
        router.push('/dashboard');
        onClose();
      },
    },
    {
      id: 'insights',
      label: 'View AI Insights & Blockers',
      category: 'Navigation',
      icon: Lightbulb,
      action: () => {
        router.push('/insights');
        onClose();
      },
    },
    {
      id: 'agent',
      label: 'View Antigravity Agent Actions',
      category: 'Navigation',
      icon: Bot,
      action: () => {
        router.push('/agent');
        onClose();
      },
    },
    {
      id: 'voice',
      label: 'Open Gemini 3.8 Live Voice Assistant',
      category: 'Navigation',
      icon: Mic,
      action: () => {
        router.push('/voice');
        onClose();
      },
    },
    {
      id: 'vision',
      label: 'Open Gemini Omni Flash UI Inspector',
      category: 'Navigation',
      icon: Eye,
      action: () => {
        router.push('/vision');
        onClose();
      },
    },
    {
      id: 'tasks',
      label: 'Manage Tasks & Subtasks',
      category: 'Navigation',
      icon: CheckSquare,
      action: () => {
        router.push('/tasks');
        onClose();
      },
    },
    {
      id: 'settings',
      label: 'AI Model Configuration & Settings',
      category: 'Navigation',
      icon: Settings,
      action: () => {
        router.push('/settings');
        onClose();
      },
    },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0F121E] border border-[#262B45] rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1E233B] gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to page..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              No commands found matching "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-[#1A1F33] transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-[#161A2B] border border-[#272D47] text-gray-400 group-hover:text-blue-400 group-hover:border-blue-500/40">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#161A2B] text-gray-400 border border-[#262B44]">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#0B0D16] border-t border-[#1C2036] flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span>First Sight Intelligent Command Center</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
