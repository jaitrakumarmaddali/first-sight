import { NextResponse } from 'next/server';
import { geminiLive } from '@/lib/ai/gemini-live';
import { geminiTranscribe } from '@/lib/ai/transcribe';
import { geminiTTS } from '@/lib/ai/tts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, query, audioData, context } = body;

    // Transcription request
    if (action === 'TRANSCRIBE') {
      const transcription = await geminiTranscribe.transcribeAudio(audioData);
      return NextResponse.json({ transcription });
    }

    // TTS request
    if (action === 'TTS') {
      const tts = await geminiTTS.synthesizeSpeech(query || 'AI response ready');
      return NextResponse.json({ tts });
    }

    // Live Voice Query
    const userQuery = query || "Why am I stuck?";
    const liveResponse = await geminiLive.processVoiceQuery(userQuery, context);
    const ttsResponse = await geminiTTS.synthesizeSpeech(liveResponse.assistantResponse);

    return NextResponse.json({
      transcription: { transcript: userQuery, confidence: 0.98 },
      liveResponse,
      tts: ttsResponse,
    });
  } catch (error: any) {
    console.error('Error handling voice request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
