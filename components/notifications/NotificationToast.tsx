'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'ACTION_REQUIRED';
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-blue-500/30';
        let bgClass = 'bg-[#101424]';
        let icon = <Info className="w-4 h-4 text-blue-400" />;

        if (toast.type === 'WARNING' || toast.type === 'ACTION_REQUIRED') {
          borderClass = 'border-amber-500/40';
          bgClass = 'bg-[#181308]';
          icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
        } else if (toast.type === 'SUCCESS') {
          borderClass = 'border-emerald-500/40';
          bgClass = 'bg-[#081812]';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
        } else if (toast.type === 'ERROR') {
          borderClass = 'border-red-500/40';
          bgClass = 'bg-[#180A0A]';
          icon = <XCircle className="w-4 h-4 text-red-400" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl ${borderClass} ${bgClass} backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white tracking-tight">{toast.title}</h4>
              <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
