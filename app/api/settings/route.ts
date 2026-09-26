export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    let config = null;
    if (workspaceId) {
      config = await prisma.aIConfiguration.findUnique({
        where: { workspaceId },
      });
    }

    if (!config) {
      config = await prisma.aIConfiguration.findFirst();
    }

    const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);

    return NextResponse.json({
      config,
      models: [
        {
          name: 'Gemini 3.8 Flash',
          modelId: 'gemini-3.8-flash',
          role: 'Primary Reasoning & Verification',
          status: hasApiKey ? 'Available (Live API)' : 'Available (Intelligent Engine)',
          badge: 'Online',
        },
        {
          name: 'Gemma 4',
          modelId: 'gemma-4-e4b',
          role: 'Edge Activity Classification & Noise Suppression',
          status: 'Available (Active)',
          badge: 'Edge SLM',
        },
        {
          name: 'Gemini 3.8 Live',
          modelId: 'gemini-3.8-live',
          role: 'Real-Time Conversational Voice Assistant',
          status: 'Available',
          badge: 'Voice',
        },
        {
          name: 'Gemini 3.5 Transcribe',
          modelId: 'gemini-3.5-transcribe',
          role: 'Speech-to-Text Transcription',
          status: 'Available',
          badge: 'Audio',
        },
        {
          name: 'Gemini 3.8 Flash TTS',
          modelId: 'gemini-3.8-flash-tts',
          role: 'Response Speech Synthesis',
          status: 'Available',
          badge: 'TTS',
        },
        {
          name: 'Gemini Omni Flash',
          modelId: 'gemini-omni-1.1-flash',
          role: 'Multimodal Vision & UI Inspection',
          status: 'Available',
          badge: 'Vision',
        },
        {
          name: 'Antigravity Agent',
          modelId: 'antigravity-agent-v1',
          role: 'Safe Workspace Action Execution Layer',
          status: 'Ready (Approval-Gated)',
          badge: 'Agent Layer',
        },
      ],
      hasApiKey,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, monitoringActive, autoSuggest, sensitivity, isDemoMode } = body;

    const updated = await prisma.aIConfiguration.update({
      where: { workspaceId },
      data: {
        monitoringActive,
        autoSuggest,
        sensitivity,
        isDemoMode,
      },
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
