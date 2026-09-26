/**
 * Firebase Admin SDK — SERVER SIDE ONLY
 * Never import this in client components.
 * Used to verify Firebase ID tokens in API routes.
 */
import * as admin from 'firebase-admin';

let adminApp: admin.app.App | null = null;

export function getAdminApp(): admin.app.App | null {
  if (adminApp) return adminApp;

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // If we have service account credentials, use them for production
  if (projectId && clientEmail && privateKey) {
    if (!admin.apps.length) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        projectId,
      });
    } else {
      adminApp = admin.app();
    }
    return adminApp;
  }

  // Fallback: initialize with just projectId (works for verifying tokens if FIREBASE_PROJECT_ID is set)
  if (projectId) {
    if (!admin.apps.length) {
      // Use application default credentials if available, otherwise we can't verify tokens server-side
      try {
        adminApp = admin.initializeApp({ projectId });
      } catch {
        adminApp = admin.app();
      }
    } else {
      adminApp = admin.app();
    }
    return adminApp;
  }

  return null;
}

/**
 * Verifies a Firebase ID token from the Authorization header.
 * Returns the decoded token (with uid, email, etc.) or throws.
 */
export async function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  const app = getAdminApp();
  if (!app) {
    throw new Error(
      'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID (and optionally FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY) environment variables.'
    );
  }
  return admin.auth(app).verifyIdToken(idToken);
}

/**
 * Extracts and verifies the Bearer token from a Request.
 * Throws a 401-safe error if missing or invalid.
 */
export async function getVerifiedUser(request: Request): Promise<{ uid: string; email: string | undefined; name: string | undefined }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  const token = authHeader.slice(7);
  const decoded = await verifyIdToken(token);
  return {
    uid: decoded.uid,
    email: decoded.email,
    name: decoded.name,
  };
}

export function isAdminConfigured(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return !!projectId;
}
