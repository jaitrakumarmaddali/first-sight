'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, isFirebaseConfigured, getCurrentIdToken } from '@/lib/firebase/client';
import type { FirebaseUser } from '@/lib/firebase/client';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  firebaseConfigured: boolean;
  idToken: string | null;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  firebaseConfigured: false,
  idToken: null,
  refreshToken: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);
  const configured = isFirebaseConfigured();

  const refreshToken = async () => {
    if (user) {
      const token = await getCurrentIdToken();
      setIdToken(token);
    }
  };

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
          // Sync user to First Sight database
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err) {
          console.error('[AuthProvider] Token/sync error:', err);
        }
      } else {
        setIdToken(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [configured]);

  return (
    <AuthContext.Provider value={{ user, loading, firebaseConfigured: configured, idToken, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
