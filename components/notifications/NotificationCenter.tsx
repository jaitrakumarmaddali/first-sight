'use client';

import React from 'react';
import { Bell, CheckCheck, X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}: NotificationCenterProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="absolute top-14 right-4 sm:right-6 w-80 sm:w-96 bg-[#0E111C] border border-[#232840] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1F33]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Notifications Center
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#171B2D]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No recent notifications
            </div>
          ) : (
            notifications.map((n) => {
              let icon = <Info className="w-4 h-4 text-blue-400 shrink-0" />;
              if (n.type === 'WARNING' || n.type === 'ACTION_REQUIRED') {
                icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
              } else if (n.type === 'SUCCESS') {
                icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
              }

              return (
                <div
                  key={n.id}
                  className={`p-3.5 flex items-start gap-3 hover:bg-[#141829] transition-colors ${
                    !n.read ? 'bg-[#121628]/60' : ''
                  }`}
                >
                  <div className="mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-200 truncate">{n.title}</p>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
