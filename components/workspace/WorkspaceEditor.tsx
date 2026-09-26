'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle,
  Save,
  RotateCcw,
  Eye,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface WorkspaceEditorProps {
  files: Record<string, string>;
  activeFile: string;
  onSelectFile: (file: string) => void;
  onCodeChange: (code: string) => void;
  onSave: () => void;
  onRunCode: () => void;
  onRunTests: () => void;
  onInspectVision?: () => void;
  isRunning?: boolean;
  isTesting?: boolean;
}

export function WorkspaceEditor({
  files,
  activeFile,
  onSelectFile,
  onCodeChange,
  onSave,
  onRunCode,
  onRunTests,
  onInspectVision,
  isRunning = false,
  isTesting = false,
}: WorkspaceEditorProps) {
  const currentContent = files[activeFile] || '';
  const [localCode, setLocalCode] = useState(currentContent);

  useEffect(() => {
    setLocalCode(files[activeFile] || '');
  }, [activeFile, files]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalCode(val);
    onCodeChange(val);
  };

  // Generate line numbers
  const lines = localCode.split('\n');
  const lineCount = Math.max(lines.length, 18);

  const fileTabs = Object.keys(files);

  return (
    <div className="bg-[#0B0D17] border border-[#1E2338] rounded-xl flex flex-col h-full overflow-hidden shadow-xl">
      {/* Editor Tabs & Action Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1A1F33] bg-[#080A12] px-3 py-2 gap-2">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {fileTabs.map((tab) => {
            const isActive = tab === activeFile;
            return (
              <button
                key={tab}
                onClick={() => onSelectFile(tab)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  isActive
                    ? 'bg-[#151828] text-blue-400 border border-[#272D47] font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#101322]'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls: Run, Test, Save */}
        <div className="flex items-center gap-2">
          {onInspectVision && (
            <button
              onClick={onInspectVision}
              title="Inspect workspace with Gemini Omni Flash"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141829] border border-[#232842] text-xs text-gray-300 hover:text-white hover:border-violet-500/40 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Vision</span>
            </button>
          )}

          <button
            onClick={onSave}
            title="Save file changes (Ctrl+S)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141829] border border-[#232842] text-xs font-medium text-gray-300 hover:text-white hover:border-[#353B60] transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={onRunTests}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/40 hover:bg-violet-600/30 text-violet-300 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <CheckCircle className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : 'text-violet-400'}`} />
            <span>{isTesting ? 'Testing...' : 'Run Tests'}</span>
          </button>

          <button
            onClick={onRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-xs">
        {/* Line Numbers */}
        <div className="w-12 bg-[#090B14] border-r border-[#171B2D] text-gray-400 select-none py-3 pr-3 text-right font-mono leading-6">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <div className="flex-1 relative overflow-auto bg-[#0A0C16]">
          <textarea
            value={localCode}
            onChange={handleChange}
            spellCheck={false}
            className="w-full h-full min-h-[380px] p-3 bg-transparent text-gray-200 font-mono text-xs leading-6 resize-none focus:outline-none selection:bg-blue-500/30"
          />
        </div>
      </div>

      {/* Editor Status Bar */}
      <div className="px-4 py-1.5 bg-[#080A12] border-t border-[#171A2B] flex items-center justify-between text-[11px] text-gray-400 font-mono">
        <div className="flex items-center gap-3">
          <span>Python 3.13</span>
          <span>UTF-8</span>
          <span>Spaces: 4</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Lines: {lines.length}</span>
          <span className="text-blue-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            First Sight Active
          </span>
        </div>
      </div>
    </div>
  );
}
