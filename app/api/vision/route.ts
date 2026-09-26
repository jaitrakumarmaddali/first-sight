import { NextResponse } from 'next/server';
import { geminiVision } from '@/lib/ai/vision';
import prisma from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, imageBase64 } = body;

    const analysis = await geminiVision.analyzeScreenshot(imageBase64);

    if (workspaceId) {
      await prisma.visionAnalysis.create({
        data: {
          workspaceId,
          imageUrl: imageBase64 ? imageBase64.slice(0, 100) + '...' : '/screenshot-demo.png',
          issuesDetected: JSON.stringify(analysis.issuesDetected),
          explanation: analysis.explanation,
          suggestedFix: analysis.suggestedFix,
          confidence: analysis.confidence,
          analyzedByModel: analysis.model,
        },
      });

      await prisma.activityEvent.create({
        data: {
          workspaceId,
          eventType: 'AI_ANALYSIS',
          category: 'AI',
          description: 'Gemini Omni Flash inspected UI screenshot: 3 issues identified',
          isSignificant: true,
          gemmaClass: 'VISION_INSPECTION',
        },
      });
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Error analyzing vision screenshot:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
