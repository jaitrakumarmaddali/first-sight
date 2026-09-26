export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { isFirebaseConfigured } from '@/lib/firebase/client';

/**
 * GET /api/auth/status
 * Returns the Firebase configuration status (public info only — no keys).
 */
export async function GET() {
  const clientConfigured = isFirebaseConfigured();
  const adminConfigured = isAdminConfigured();

  return NextResponse.json({
    firebase: {
      clientConfigured,
      adminConfigured,
      status: clientConfigured && adminConfigured ? 'CONNECTED' : clientConfigured ? 'PARTIAL' : 'NOT_CONFIGURED',
      missing: [
        ...(!process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? ['NEXT_PUBLIC_FIREBASE_API_KEY'] : []),
        ...(!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? ['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] : []),
        ...(!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? ['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] : []),
        ...(!process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? ['NEXT_PUBLIC_FIREBASE_APP_ID'] : []),
        ...(!process.env.FIREBASE_PROJECT_ID && !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? ['FIREBASE_PROJECT_ID'] : []),
      ],
    },
  });
}
