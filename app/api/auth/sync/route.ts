export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getVerifiedUser, isAdminConfigured } from '@/lib/firebase/admin';
import prisma from '@/lib/db/prisma';

/**
 * POST /api/auth/sync
 * Called immediately after Firebase login to ensure the Firebase user
 * has a corresponding First Sight User + default Workspace in the DB.
 */
export async function POST(request: Request) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        {
          error: 'Firebase Admin is not configured.',
          required: [
            'FIREBASE_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID)',
            'FIREBASE_CLIENT_EMAIL (recommended)',
            'FIREBASE_PRIVATE_KEY (recommended)',
          ],
        },
        { status: 503 }
      );
    }

    const verified = await getVerifiedUser(request);

    // Upsert user: find by firebaseUid or create
    let dbUser = await prisma.user.findUnique({
      where: { firebaseUid: verified.uid },
    });

    if (!dbUser) {
      // Also check by email to avoid duplicates if schema migration left stale rows
      const byEmail = await prisma.user.findUnique({ where: { email: verified.email || '' } });
      if (byEmail) {
        // Update existing email user with firebaseUid
        dbUser = await prisma.user.update({
          where: { id: byEmail.id },
          data: { firebaseUid: verified.uid },
        });
      } else {
        dbUser = await prisma.user.create({
          data: {
            firebaseUid: verified.uid,
            email: verified.email || '',
            name: verified.name || verified.email?.split('@')[0] || 'User',
          },
        });
      }
    }

    // Ensure the user has a default workspace
    const existingWorkspace = await prisma.workspace.findFirst({
      where: { userId: dbUser.id, slug: 'default' },
    });

    if (!existingWorkspace) {
      await prisma.workspace.create({
        data: {
          userId: dbUser.id,
          name: 'My Workspace',
          slug: 'default',
          description: 'Your First Sight workspace',
          activeFile: 'main.py',
          filesData: JSON.stringify({
            'main.py': '# Welcome to First Sight!\n# Create a task to get started.\n',
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
      },
    });
  } catch (error: any) {
    console.error('[/api/auth/sync] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
