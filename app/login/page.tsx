'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, Chrome } from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  isFirebaseConfigured,
} from '@/lib/firebase/client';
import { useAuth } from '@/lib/firebase/AuthContext';

type Mode = 'signin' | 'signup';

function FirebaseNotConfiguredBanner() {
  return (
    <div className="w-full max-w-md mx-auto mt-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm space-y-3">
      <div className="flex items-center gap-2 font-bold text-amber-200">
        <AlertCircle className="w-5 h-5" />
        Firebase Not Configured
      </div>
      <p className="text-xs leading-relaxed text-amber-300/90">
        Authentication is not available because Firebase environment variables are missing.
        Add the following to your <code className="px-1 py-0.5 rounded bg-amber-500/20 font-mono text-amber-200">.env</code> file:
      </p>
      <pre className="text-[11px] font-mono bg-black/30 rounded-xl p-3 leading-relaxed text-amber-100 whitespace-pre-wrap">
{`NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=`}
      </pre>
      <p className="text-xs text-amber-400/80">
        Get your Firebase config from{' '}
        <a
          href="https://console.firebase.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-amber-200"
        >
          console.firebase.google.com
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, firebaseConfigured } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Already authenticated → redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const friendlyError = (code: string): string => {
    const map: Record<string, string> = {
      'auth/user-not-found': 'No account found with that email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Incorrect email or password.',
      'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please wait a moment and try again.',
      'auth/network-request-failed': 'Network error. Check your connection and try again.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    };
    return map[code] || 'Authentication failed. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name.trim()) { setError('Please enter your name.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, name.trim());
      } else {
        await signInWithEmail(email, password);
      }
      // AuthProvider will handle the sync + redirect
    } catch (err: any) {
      setError(friendlyError(err.code || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(friendlyError(err.code || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080A0F] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-8 z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">FIRST SIGHT</h1>
        <p className="text-sm text-gray-400 mt-1 text-center max-w-xs leading-relaxed">
          AI that sees what you&apos;re working on<br />and helps before you ask.
        </p>
      </div>

      {!firebaseConfigured ? (
        <FirebaseNotConfiguredBanner />
      ) : (
        <div className="w-full max-w-md z-10">
          <div className="bg-[#0B0D18] border border-[#1E2338] rounded-2xl p-8 shadow-2xl space-y-6">
            {/* Mode tabs */}
            <div className="flex rounded-xl overflow-hidden border border-[#1E2338] bg-[#080A0F]">
              {(['signin', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-2.5 text-xs font-bold transition-all ${
                    mode === m
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {m === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
              {/* Name (signup only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141829] border border-[#232842] text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141829] border border-[#232842] text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                    required
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#141829] border border-[#232842] text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (signup only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      id="auth-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      autoComplete="new-password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141829] border border-[#232842] text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                id="auth-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#1E2338]" />
              <span className="text-xs text-gray-500">or</span>
              <div className="flex-1 h-px bg-[#1E2338]" />
            </div>

            {/* Google Sign In */}
            <button
              id="auth-google"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-[#141829] border border-[#232842] hover:border-blue-500/40 text-white font-medium text-sm transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
            >
              <Chrome className="w-4 h-4 text-blue-400" />
              Continue with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
