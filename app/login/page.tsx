'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, Chrome, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
} from '@/lib/firebase/client';
import { useAuth } from '@/lib/firebase/AuthContext';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, firebaseConfigured, signInAsDeveloper } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConsoleHelp, setShowConsoleHelp] = useState(false);

  // Already authenticated → redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const friendlyError = (code: string): string => {
    if (code === 'auth/configuration-not-found' || code.includes('configuration-not-found')) {
      setShowConsoleHelp(true);
      return 'Firebase Authentication is not yet enabled in Firebase Console. Enable "Email/Password" in your Firebase console, or use Developer 1-Click Access below.';
    }
    if (code === 'auth/operation-not-allowed') {
      setShowConsoleHelp(true);
      return 'Email/Password provider is disabled in Firebase Console. Enable it under Build > Authentication > Sign-in method.';
    }
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
    return map[code] || 'Authentication failed. Please check your credentials or use Developer Sign In.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowConsoleHelp(false);

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
      // AuthProvider handles redirect
    } catch (err: any) {
      const code = err.code || err.message || '';
      setError(friendlyError(code));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setShowConsoleHelp(false);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      const code = err.code || err.message || '';
      setError(friendlyError(code));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeveloperAccess = async () => {
    setIsSubmitting(true);
    try {
      const devName = name.trim() || 'Alex Vance';
      const devEmail = email.trim() || 'engineer@firstsight.ai';
      await signInAsDeveloper(devName, devEmail);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message);
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
      <div className="flex flex-col items-center mb-6 z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-3">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">FIRST SIGHT</h1>
        <p className="text-xs text-gray-400 mt-1 text-center max-w-xs leading-relaxed">
          AI that sees what you&apos;re working on<br />and helps before you ask.
        </p>
      </div>

      <div className="w-full max-w-md z-10 space-y-4">
        {/* Main Card */}
        <div className="bg-[#0B0D18] border border-[#1E2338] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Mode tabs */}
          <div className="flex rounded-xl overflow-hidden border border-[#1E2338] bg-[#080A0F]">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setShowConsoleHelp(false); }}
                className={`flex-1 py-2 text-xs font-bold transition-all ${
                  mode === m
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" id="auth-form">
            {/* Name (signup only) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-medium">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Vance"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141829] border border-[#232842] text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@firstsight.ai"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141829] border border-[#232842] text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
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
                  className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#141829] border border-[#232842] text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
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
              <div className="space-y-1">
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
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141829] border border-[#232842] text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                  <span className="leading-relaxed">{error}</span>
                </div>
                {showConsoleHelp && (
                  <div className="pt-2 border-t border-red-500/20 text-[11px] text-gray-300 space-y-1">
                    <p className="font-semibold text-amber-300">How to enable in Firebase Console:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-gray-400">
                      <li>Go to <a href="https://console.firebase.google.com/project/first-sight-25806/authentication" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a></li>
                      <li>Click &quot;Get Started&quot;</li>
                      <li>Click &quot;Email/Password&quot; &rarr; toggle &quot;Enable&quot; &rarr; Save</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              id="auth-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {mode === 'signin' ? 'Sign In with Firebase' : 'Create Firebase Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#1E2338]" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Or Instant Access</span>
            <div className="flex-1 h-px bg-[#1E2338]" />
          </div>

          {/* 1-Click Developer Sign In */}
          <button
            id="auth-developer"
            type="button"
            onClick={handleDeveloperAccess}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-[#141829] border border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/10 text-blue-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 group"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>1-Click Developer Sign In (Bypass)</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Google Sign In */}
          <button
            id="auth-google"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-2 rounded-xl bg-[#0D101C] border border-[#1E2338] hover:border-[#2E3655] text-gray-300 font-medium text-xs transition-all flex items-center justify-center gap-2"
          >
            <Chrome className="w-3.5 h-3.5 text-blue-400" />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
