'use client';

import React, { useState } from 'react';
import {
  Terminal as TerminalIcon,
  CheckCircle2,
  AlertOctagon,
  Trash2,
  Copy,
  Clock,
} from 'lucide-react';

interface TerminalPanelProps {
  stdout: string;
  stderr: string;
  testOutput?: string;
  hasError?: boolean;
  executionTimeMs?: number;
  onClear?: () => void;
}

export function TerminalPanel({
  stdout,
  stderr,
  testOutput,
  hasError = false,
  executionTimeMs = 45,
  onClear,
}: TerminalPanelProps) {
  const [activeTab, setActiveTab] = useState<'terminal' | 'tests' | 'errors'>('terminal');

  const copyToClipboard = () => {
    const text = activeTab === 'errors' ? stderr : activeTab === 'tests' ? testOutput || stdout : stdout;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-[#0A0C16] border border-[#1E2338] rounded-xl flex flex-col h-full overflow-hidden shadow-lg">
      {/* Terminal Tab Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1A1F33] bg-[#070910]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-colors ${
              activeTab === 'terminal'
                ? 'bg-[#151929] text-gray-200 border border-[#272D47] font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-colors ${
              activeTab === 'tests'
                ? 'bg-[#151929] text-gray-200 border border-[#272D47] font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Suite (12)</span>
          </button>

          {hasError && (
            <button
              onClick={() => setActiveTab('errors')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                activeTab === 'errors'
                  ? 'bg-red-500/15 text-red-300 border border-red-500/30 font-semibold'
                  : 'text-red-400 hover:text-red-300'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              <span>Errors (1)</span>
            </button>
          )}
        </div>

        {/* Right Tools: Execution Time & Clear */}
        <div className="flex items-center gap-2">
          {executionTimeMs > 0 && (
            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              {executionTimeMs}ms
            </span>
          )}

          <button
            onClick={copyToClipboard}
            title="Copy Output"
            className="p-1 rounded text-gray-400 hover:text-gray-200"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {onClear && (
            <button
              onClick={onClear}
              title="Clear Terminal Output"
              className="p-1 rounded text-gray-400 hover:text-gray-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal View Content */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-relaxed">
        {activeTab === 'terminal' && (
          <div>
            {stdout ? (
              <pre className="text-gray-300 whitespace-pre-wrap">{stdout}</pre>
            ) : (
              <div className="text-gray-400 italic">No command executed yet. Click [Run Code] or [Run Tests].</div>
            )}
            {stderr && (
              <pre className="text-red-400 whitespace-pre-wrap mt-2">{stderr}</pre>
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div>
            <pre className="text-gray-300 whitespace-pre-wrap">
              {testOutput ||
                `============================= test session starts ==============================\n` +
                `12 tests registered for calculator.py.\n` +
                `Click [Run Tests] above to execute test matrix.`}
            </pre>
            {hasError && stderr && (
              <pre className="text-red-400 whitespace-pre-wrap mt-2">{stderr}</pre>
            )}
          </div>
        )}

        {activeTab === 'errors' && (
          <div>
            {stderr ? (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 text-red-300 font-bold mb-1">
                  <AlertOctagon className="w-4 h-4 text-red-400" />
                  <span>ZeroDivisionError Detected</span>
                </div>
                <pre className="text-red-400 whitespace-pre-wrap text-[11px]">{stderr}</pre>
              </div>
            ) : (
              <div className="text-emerald-400">No active errors detected!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
