'use client';

import React from 'react';
import {
  CheckCircle2,
  Circle,
  FileCode,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  progress: number;
  status: string;
  subtasks: Subtask[];
}

interface TaskContextPanelProps {
  task?: Task | null;
  activeFile: string;
  files: string[];
  focusTimeMinutes?: number;
  onSelectFile: (filename: string) => void;
  onToggleSubtask?: (subtaskId: string, completed: boolean) => void;
}

export function TaskContextPanel({
  task,
  activeFile,
  files,
  focusTimeMinutes = 42,
  onSelectFile,
  onToggleSubtask,
}: TaskContextPanelProps) {
  const currentTask = task || {
    id: 'demo-task',
    title: 'Build Python Calculator',
    progress: 78,
    status: 'IN_PROGRESS',
    subtasks: [
      { id: '1', title: 'Create interface', completed: true, order: 1 },
      { id: '2', title: 'Add input handling', completed: true, order: 2 },
      { id: '3', title: 'Handle errors', completed: false, order: 3 },
      { id: '4', title: 'Write tests', completed: false, order: 4 },
    ],
  };

  return (
    <div className="bg-[#0B0D17] border border-[#1E2338] rounded-xl flex flex-col h-full overflow-hidden shadow-lg">
      {/* Task Context Header */}
      <div className="p-4 border-b border-[#1A1F33]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold">
            Task Context
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>{focusTimeMinutes}m focus</span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-white mt-1.5 tracking-tight">
          {currentTask.title}
        </h3>

        {/* Progress Bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-gray-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Completion</span>
            </span>
            <span className="text-white font-mono font-bold">{currentTask.progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#181D30] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500 rounded-full"
              style={{ width: `${currentTask.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="p-4 border-b border-[#1A1F33] flex-1 overflow-y-auto space-y-3">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Subtasks
        </h4>

        <div className="space-y-2">
          {currentTask.subtasks.map((subtask) => {
            const isCurrent = !subtask.completed && subtask.order === 3;

            return (
              <div
                key={subtask.id}
                onClick={() => onToggleSubtask && onToggleSubtask(subtask.id, !subtask.completed)}
                className={`flex items-center gap-2.5 p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  subtask.completed
                    ? 'text-gray-400 hover:text-gray-300'
                    : isCurrent
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-200 font-medium'
                    : 'text-gray-300 hover:bg-[#131627]'
                }`}
              >
                {subtask.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-500 shrink-0" />
                )}
                <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                  {subtask.title}
                </span>
                {isCurrent && (
                  <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    Next
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace Files List */}
      <div className="p-4 bg-[#090B14]">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
          Files
        </h4>
        <div className="space-y-1">
          {files.map((filename) => {
            const isSelected = filename === activeFile;
            const isPy = filename.endsWith('.py');

            return (
              <button
                key={filename}
                onClick={() => onSelectFile(filename)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-mono text-left transition-colors ${
                  isSelected
                    ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#141728]'
                }`}
              >
                {isPy ? (
                  <FileCode className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-gray-500'}`} />
                ) : (
                  <FileText className="w-4 h-4 text-gray-500" />
                )}
                <span className="truncate">{filename}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
