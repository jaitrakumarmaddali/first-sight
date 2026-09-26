'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [workspace, setWorkspace] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('HIGH');

  const loadTasks = async () => {
    try {
      const wsRes = await fetch('/api/workspace?slug=python-calculator');
      const wsData = await wsRes.json();
      if (wsData.workspace) {
        setWorkspace(wsData.workspace);
        const tRes = await fetch(`/api/tasks?workspaceId=${wsData.workspace.id}`);
        const tData = await tRes.json();
        setTasks(tData.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !workspace) return;

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_TASK',
          workspaceId: workspace.id,
          title: newTitle,
          description: newDescription,
          priority: newPriority,
        }),
      });

      setNewTitle('');
      setNewDescription('');
      setIsCreating(false);
      loadTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_SUBTASK',
          subtaskId,
          completed: !currentCompleted,
        }),
      });
      loadTasks();
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks?taskId=${taskId}`, { method: 'DELETE' });
      loadTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2338] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                Project Tracking
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                Synchronized
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
              Tasks & Subtasks
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Active engineering goals monitored by First Sight AI.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Create Task Modal Form */}
        {isCreating && (
          <form
            onSubmit={handleCreateTask}
            className="p-5 rounded-2xl bg-[#0D101C] border border-blue-500/40 shadow-2xl space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Create New Engineering Task</h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Implement safe division edge case"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141829] border border-[#232842] text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detailed specifications or acceptance criteria..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141829] border border-[#232842] text-white focus:outline-none focus:border-blue-500 resize-none h-20"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-[#141829] border border-[#232842] text-white focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
              >
                Save Task
              </button>
            </div>
          </form>
        )}

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-[#0B0D18] border border-[#1E2338] shadow-xl space-y-4 hover:border-[#2C3352] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                        t.priority === 'HIGH' || t.priority === 'URGENT'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-[#15192B] text-gray-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">{t.title}</h3>
                  {t.description && (
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteTask(t.id)}
                  className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>Progress</span>
                  <span className="font-bold text-white">{t.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#151829] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                    style={{ width: `${t.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Subtasks */}
              {t.subtasks && t.subtasks.length > 0 && (
                <div className="pt-2 border-t border-[#171B2D] space-y-2">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Subtasks ({t.subtasks.filter((s: any) => s.completed).length}/{t.subtasks.length})
                  </span>
                  <div className="space-y-1.5">
                    {t.subtasks.map((s: any) => (
                      <div
                        key={s.id}
                        onClick={() => handleToggleSubtask(s.id, s.completed)}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          s.completed
                            ? 'text-gray-500 hover:text-gray-400 bg-[#0C0E1A]/40'
                            : 'text-gray-200 hover:bg-[#13172A] bg-[#0E1120]'
                        }`}
                      >
                        {s.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-500 shrink-0" />
                        )}
                        <span className={s.completed ? 'line-through' : ''}>
                          {s.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
