export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getVerifiedUser, isAdminConfigured } from '@/lib/firebase/admin';
import prisma from '@/lib/db/prisma';

/**
 * POST /api/auth/sync
 * Called after login to ensure the user has a record in the database
 * and an isolated workspace.
 */
export async function POST(request: Request) {
  try {
    let verified: { uid: string; email?: string; name?: string };

    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      verified = await getVerifiedUser(request);
    } else {
      // Body payload fallback
      const body = await request.json().catch(() => ({}));
      if (body.uid) {
        verified = {
          uid: body.uid,
          email: body.email,
          name: body.name,
        };
      } else {
        return NextResponse.json({ error: 'Unauthorized: missing credentials' }, { status: 401 });
      }
    }

    const email = verified.email || `${verified.uid}@firstsight.local`;
    const name = verified.name || email.split('@')[0] || 'Developer';

    // Upsert user by firebaseUid or email
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: verified.uid },
          { email },
        ],
      },
    });

    if (dbUser) {
      if (dbUser.firebaseUid !== verified.uid) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { firebaseUid: verified.uid },
        });
      }
    } else {
      dbUser = await prisma.user.create({
        data: {
          firebaseUid: verified.uid,
          email,
          name,
        },
      });
    }

    // Ensure the user has a workspace
    const userWorkspace = await prisma.workspace.findFirst({
      where: { userId: dbUser.id },
    });

    if (!userWorkspace) {
      const userSlug = `workspace-${dbUser.id.toLowerCase()}`;
      await prisma.workspace.create({
        data: {
          userId: dbUser.id,
          name: `${dbUser.name}'s Workspace`,
          slug: userSlug,
          description: 'Personal engineering workspace',
          activeFile: 'calculator.py',
          filesData: JSON.stringify({
            'calculator.py': 'def calculate(a, b, operation):\n    if operation == "add":\n        return a + b\n    if operation == "divide":\n        return a / b\n    return None\n',
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
