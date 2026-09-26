export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const CONFIGURED_MODEL = process.env.GEMINI_FLASH_MODEL || 'gemini-1.5-flash';

/**
 * POST /api/ai/test-connection
 * Sends a real minimal request to the Gemini API and reports latency + result.
 * Never fakes the result.
 */
export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      model: CONFIGURED_MODEL,
      error: 'GEMINI_API_KEY environment variable is not set.',
      required: 'GEMINI_API_KEY',
      status: 'NOT_CONFIGURED',
    });
  }

  const startMs = Date.now();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${CONFIGURED_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Reply with exactly: {"status":"ok","model":"' + CONFIGURED_MODEL + '"}',
                },
              ],
            },
          ],
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 32 },
        }),
      }
    );

    const latencyMs = Date.now() - startMs;

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: { message: res.statusText } }));
      const reason = errData?.error?.message || res.statusText;

      // Detect common model-not-found error
      const modelInvalid =
        res.status === 404 ||
        reason.toLowerCase().includes('not found') ||
        reason.toLowerCase().includes('model');

      return NextResponse.json({
        success: false,
        model: CONFIGURED_MODEL,
        status: 'ERROR',
        error: reason,
        hint: modelInvalid
          ? `The model "${CONFIGURED_MODEL}" may not be available. Try updating GEMINI_FLASH_MODEL in your .env file. Valid options include: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash-exp`
          : undefined,
        latencyMs,
      });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return NextResponse.json({
      success: true,
      model: CONFIGURED_MODEL,
      status: 'CONNECTED',
      response: text.length > 0 ? 'Connection test successful' : 'Connected (empty response)',
      latencyMs,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      model: CONFIGURED_MODEL,
      status: 'ERROR',
      error: err.message || 'Network error connecting to Gemini API',
      latencyMs: Date.now() - startMs,
    });
  }
}

/**
 * GET /api/ai/test-connection
 * Returns configuration status without making a live request.
 */
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = CONFIGURED_MODEL;

  return NextResponse.json({
    gemini: {
      model,
      status: apiKey ? 'CONFIGURED' : 'NOT_CONFIGURED',
      required: 'GEMINI_API_KEY',
    },
    gemma: {
      status: 'NOT_CONFIGURED',
      note: 'Gemma 4 is a pattern-detection classifier. The current implementation uses a deterministic rule-based fallback labeled DEVELOPMENT_FALLBACK. To use a real Gemma model, configure a local Ollama endpoint or Vertex AI access.',
      required: 'GEMMA_API_URL (optional)',
    },
    vision: {
      model: process.env.GEMINI_FLASH_MODEL || 'gemini-1.5-flash',
      status: apiKey ? 'CONFIGURED' : 'NOT_CONFIGURED',
      note: 'Vision uses the same Gemini API key',
    },
    tts: {
      status: 'DEVELOPMENT_FALLBACK',
      note: 'TTS uses browser Web Speech API (SpeechSynthesis). No server key required.',
    },
    transcription: {
      status: 'DEVELOPMENT_FALLBACK',
      note: 'Transcription uses browser Web Speech API (SpeechRecognition). No server key required.',
    },
    live: {
      status: process.env.GEMINI_LIVE_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
      required: 'GEMINI_LIVE_API_KEY (optional)',
    },
  });
}
