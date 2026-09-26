export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || 'python-calculator';

    let workspace = await prisma.workspace.findFirst({
      where: { slug },
      include: {
        tasks: {
          include: { subtasks: { orderBy: { order: 'asc' } } },
        },
        insights: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        agentActions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { executions: { include: { verification: true } } },
        },
        aiConfig: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const files = workspace.filesData ? JSON.parse(workspace.filesData) : {};

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        activeFile: workspace.activeFile,
        files,
        focusTimeMinutes: workspace.focusTimeMinutes,
        tasks: workspace.tasks,
        insights: workspace.insights,
        agentActions: workspace.agentActions,
        aiConfig: workspace.aiConfig,
      },
    });
  } catch (error: any) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, activeFile, content, filesData } = body;

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    let updatedFiles = workspace.filesData ? JSON.parse(workspace.filesData) : {};

    if (filesData) {
      updatedFiles = filesData;
    } else if (activeFile && content !== undefined) {
      updatedFiles[activeFile] = content;
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        activeFile: activeFile || workspace.activeFile,
        filesData: JSON.stringify(updatedFiles),
      },
    });

    // Record file edited/saved event
    if (activeFile && content !== undefined) {
      await prisma.activityEvent.create({
        data: {
          workspaceId,
          eventType: 'FILE_SAVED',
          category: 'FILES',
          description: `Saved changes to ${activeFile}`,
          metadata: JSON.stringify({ file: activeFile, size: content.length }),
          isSignificant: true,
          gemmaClass: 'FILE_PERSIST',
        },
      });
    }

    return NextResponse.json({
      success: true,
      workspace: {
        id: updated.id,
        activeFile: updated.activeFile,
        files: updatedFiles,
      },
    });
  } catch (error: any) {
    console.error('Error updating workspace:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
