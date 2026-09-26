'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Code2,
  CheckSquare,
  Activity,
  Lightbulb,
  Bot,
  Mic,
  Eye,
  Settings,
  Sparkles,
  X,
  LogOut,
  User,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { signOutUser } from '@/lib/firebase/client';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workspace', label: 'Workspace', icon: Code2 },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/activity', label: 'Activity Stream', icon: Activity },
  { href: '/insights', label: 'AI Insights', icon: Lightbulb },
  { href: '/agent', label: 'Agent Actions', icon: Bot },
  { href: '/voice', label: 'Voice Assistant', icon: Mic },
  { href: '/vision', label: 'Vision Assistant', icon: Eye },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  aiMonitoring?: boolean;
  aiStatusLabel?: string;
}

export function Sidebar({
  isMobileOpen = false,
  onCloseMobile,
  aiMonitoring = true,
  aiStatusLabel,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isFirebaseConfigured: firebaseConfigured } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOutUser();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Developer';
  const displayEmail = user?.email || 'dev@firstsight.ai';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const statusLabel = aiStatusLabel || (aiMonitoring ? 'AI Observing' : 'AI Paused');

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0A0D14] border-r border-[#1B2030] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#1B2030]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                FIRST SIGHT
              </span>
              <span className="text-[10px] text-blue-400 font-mono tracking-wider">
                PROACTIVE AI
              </span>
            </div>
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-[#121624]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-200'
                  }`}
                />
                <span>{item.label}</span>
                {item.href === '/agent' && (
                  <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                    AGENT
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#1B2030] space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0D101C] border border-[#1E2338]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {aiMonitoring && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    aiMonitoring ? 'bg-emerald-500' : 'bg-gray-500'
                  }`}
                />
              </span>
              <span className="text-xs font-medium text-gray-200">{statusLabel}</span>
            </div>
            {!firebaseConfigured && (
              <span title="Firebase not configured">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              </span>
            )}
          </div>

          {user ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-[#131627]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow shrink-0">
                  {initials || <User className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{displayName}</div>
                  <div className="text-[10px] text-gray-400 truncate">{displayEmail}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-[#121624] hover:bg-red-500/10 border border-transparent hover:border-red-500/30 text-gray-400 hover:text-red-400 text-xs transition-all disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#131627]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                  FS
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-300">Workspace User</div>
                  <div className="text-[10px] text-gray-500">
                    {firebaseConfigured ? 'Not signed in' : 'Local Dev Mode'}
                  </div>
                </div>
              </div>
              {firebaseConfigured && (
                <Link
                  href="/login"
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                >
                  Log In
                </Link>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
