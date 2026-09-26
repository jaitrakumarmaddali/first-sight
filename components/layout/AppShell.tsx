'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { NotificationToast, ToastMessage } from '../notifications/NotificationToast';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { AIBrainStateType } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  brainState?: AIBrainStateType;
  onStartDemo?: () => void;
  onResetDemo?: () => void;
  aiStatusLabel?: string;
}

export function AppShell({
  children,
  brainState = 'MONITORING',
  onStartDemo,
  onResetDemo,
  aiStatusLabel,
}: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [aiMonitoring, setAiMonitoring] = useState(true);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  // Real notifications come from /api/notifications — start empty
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#080A0F] text-gray-200 flex flex-col font-sans selection:bg-blue-500/25 selection:text-white">
        {/* Sidebar for Desktop & Collapsible for Mobile */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          aiMonitoring={aiMonitoring}
          aiStatusLabel={aiStatusLabel}
        />

        {/* Main Container Offset by Sidebar width on Desktop */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* Topbar */}
          <Topbar
            brainState={brainState}
            aiMonitoring={aiMonitoring}
            onToggleMonitoring={() => setAiMonitoring((prev) => !prev)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
            onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
            onStartDemo={onStartDemo}
            unreadNotificationsCount={unreadCount}
          />

          {/* Page Content */}
          <main className="flex-1 flex flex-col">{children}</main>
        </div>

        {/* Command Palette Modal */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onStartDemo={onStartDemo}
          onResetDemo={onResetDemo}
        />

        {/* Notification Center Panel */}
        <NotificationCenter
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
        />

        {/* Real-time Toasts */}
        <NotificationToast toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    </ProtectedRoute>
  );
}
