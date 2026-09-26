import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { geminiFlash } from '@/lib/ai/gemini-flash';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { insightId, workspaceId } = body;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    const files = workspace?.filesData ? JSON.parse(workspace.filesData) : {};
    const activeFile = workspace?.activeFile || 'calculator.py';
    const code = files[activeFile] || '';

    const explanation = await geminiFlash.explainError(
      code,
      'ZeroDivisionError: division by zero',
      activeFile
    );

    return NextResponse.json({
      success: true,
      explanation,
    });
  } catch (error: any) {
    console.error('Error generating explanation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
