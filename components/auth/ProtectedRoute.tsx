'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Zap } from 'lucide-react';
import { useAuth } from '@/lib/firebase/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps any page that requires authentication.
 * If Firebase is configured: redirects to /login when not authenticated.
 * If Firebase is NOT configured: renders children (development mode).
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, firebaseConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && firebaseConfigured && !user) {
      router.replace('/login');
    }
  }, [user, loading, firebaseConfigured, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080A0F] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center animate-pulse">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        <p className="text-xs text-gray-500 font-mono">Loading First Sight...</p>
      </div>
    );
  }

  if (firebaseConfigured && !user) {
    // Redirecting — render nothing
    return null;
  }

  return <>{children}</>;
}
