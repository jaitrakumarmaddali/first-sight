export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    const where: any = {};
    if (workspaceId) where.workspaceId = workspaceId;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        subtasks: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, taskId, subtaskId, workspaceId, title, description, priority, completed } = body;

    // Toggle subtask completion
    if (action === 'TOGGLE_SUBTASK' && subtaskId) {
      const subtask = await prisma.subtask.findUnique({ where: { id: subtaskId } });
      if (!subtask) return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });

      const updatedSubtask = await prisma.subtask.update({
        where: { id: subtaskId },
        data: { completed: completed !== undefined ? completed : !subtask.completed },
      });

      // Recalculate parent task progress
      const allSubtasks = await prisma.subtask.findMany({ where: { taskId: subtask.taskId } });
      const completedCount = allSubtasks.filter(s => s.completed).length;
      const progress = Math.round((completedCount / (allSubtasks.length || 1)) * 100);

      const updatedTask = await prisma.task.update({
        where: { id: subtask.taskId },
        data: {
          progress,
          status: progress === 100 ? 'COMPLETED' : 'IN_PROGRESS',
        },
        include: { subtasks: { orderBy: { order: 'asc' } } },
      });

      return NextResponse.json({ task: updatedTask, subtask: updatedSubtask });
    }

    // Create new task
    if (action === 'CREATE_TASK' || (!action && title && workspaceId)) {
      const newTask = await prisma.task.create({
        data: {
          workspaceId,
          title,
          description: description || '',
          priority: priority || 'MEDIUM',
          progress: 0,
          status: 'NOT_STARTED',
        },
        include: { subtasks: true },
      });

      return NextResponse.json({ task: newTask });
    }

    // Update task
    if (action === 'UPDATE_TASK' && taskId) {
      const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          priority: priority !== undefined ? priority : undefined,
        },
        include: { subtasks: true },
      });

      return NextResponse.json({ task: updated });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling task request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    await prisma.task.delete({ where: { id: taskId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
