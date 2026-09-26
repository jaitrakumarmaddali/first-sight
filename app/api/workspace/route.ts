export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const listOnly = searchParams.get('list') === 'true';

    // Return list of all projects / workspaces
    if (listOnly) {
      const workspaces = await prisma.workspace.findMany({
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          activeFile: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return NextResponse.json({ workspaces });
    }

    let whereClause: any = {};
    if (id) {
      whereClause = { id };
    } else if (slug) {
      whereClause = { slug };
    }

    let workspace = await prisma.workspace.findFirst({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      orderBy: { updatedAt: 'desc' },
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
      // Fallback: create default workspace if completely empty
      workspace = await prisma.workspace.create({
        data: {
          name: 'Primary Project',
          slug: 'primary-project',
          description: 'Production Engineering Project',
          activeFile: 'main.py',
          filesData: JSON.stringify({
            'main.py': '# First Sight Python Workspace\n\ndef main():\n    print("Hello from First Sight AI!")\n\nif __name__ == "__main__":\n    main()\n',
          }),
        },
        include: {
          tasks: { include: { subtasks: true } },
          insights: true,
          agentActions: true,
          aiConfig: true,
        },
      });
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, activeFile = 'main.py' } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const initialFiles = {
      [activeFile]: `# Project: ${name}\n# Powered by First Sight AI\n\ndef run():\n    print("Starting ${name}...")\n\nif __name__ == "__main__":\n    run()\n`,
    };

    const newWorkspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        description: description || `Workspace for ${name}`,
        activeFile,
        filesData: JSON.stringify(initialFiles),
      },
    });

    // Create a starter task for the new project
    await prisma.task.create({
      data: {
        workspaceId: newWorkspace.id,
        title: `Initialize ${name}`,
        description: 'Set up core modules and verify test suite',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        progress: 10,
        subtasks: {
          create: [
            { title: 'Define data models and core logic', completed: false, order: 1 },
            { title: 'Add test cases and edge validation', completed: false, order: 2 },
          ],
        },
      },
    });

    // Log project creation event
    await prisma.activityEvent.create({
      data: {
        workspaceId: newWorkspace.id,
        eventType: 'PROJECT_CREATED',
        category: 'SYSTEM',
        description: `Created new project "${name}"`,
        isSignificant: true,
        gemmaClass: 'MILESTONE',
      },
    });

    return NextResponse.json({
      success: true,
      workspace: {
        id: newWorkspace.id,
        name: newWorkspace.name,
        slug: newWorkspace.slug,
        description: newWorkspace.description,
        activeFile: newWorkspace.activeFile,
        files: initialFiles,
      },
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
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
