'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Bot,
  User,
  Radio,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function VoicePage() {
  const [state, setState] = useState<'Ready' | 'Listening' | 'Processing' | 'Speaking' | 'Error'>('Ready');
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [history, setHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: "First Sight Voice Assistant active. Ask me anything about your current Python Calculator workspace, like 'Why am I stuck?'",
    },
  ]);

  const waveformInterval = useRef<NodeJS.Timeout | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>([15, 30, 20, 45, 60, 35, 75, 40, 55, 30, 20, 15]);

  // Animate waveform when listening or speaking
  useEffect(() => {
    if (state === 'Listening' || state === 'Speaking') {
      waveformInterval.current = setInterval(() => {
        setWaveformBars(
          Array.from({ length: 16 }).map(() => Math.floor(Math.random() * 70) + 15)
        );
      }, 120);
    } else {
      if (waveformInterval.current) clearInterval(waveformInterval.current);
      setWaveformBars([15, 20, 18, 25, 30, 22, 28, 20, 25, 18, 22, 15]);
    }

    return () => {
      if (waveformInterval.current) clearInterval(waveformInterval.current);
    };
  }, [state]);

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setState('Ready');
      utterance.onerror = () => setState('Ready');
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setState('Ready'), 3000);
    }
  };

  const handleStartListening = async () => {
    if (state === 'Listening') {
      setState('Ready');
      return;
    }

    setState('Listening');
    setTranscript('Listening for query...');

    // Simulate speech-to-text / Gemini Transcribe
    setTimeout(async () => {
      const detectedQuery = "Why am I stuck?";
      setTranscript(detectedQuery);
      setState('Processing');

      setHistory((prev) => [...prev, { sender: 'user', text: detectedQuery }]);

      try {
        const res = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: detectedQuery,
            context: {
              activeFile: 'calculator.py',
              recentError: 'ZeroDivisionError: division by zero',
              errorCount: 3,
              taskTitle: 'Build Python Calculator',
            },
          }),
        });

        const data = await res.json();
        const responseText =
          data.liveResponse?.assistantResponse ||
          "You've encountered the same division error three times in calculate(). When operation is 'divide' and denominator is 0, Python raises ZeroDivisionError.";

        setAiResponse(responseText);
        setHistory((prev) => [...prev, { sender: 'ai', text: responseText }]);
        setState('Speaking');

        // Play audio with TTS
        speakText(responseText);
      } catch (err) {
        console.error('Voice query error:', err);
        setState('Ready');
      }
    }, 2200);
  };

  const handleSampleQuery = async (queryText: string) => {
    setTranscript(queryText);
    setState('Processing');
    setHistory((prev) => [...prev, { sender: 'user', text: queryText }]);

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          context: {
            activeFile: 'calculator.py',
            recentError: 'ZeroDivisionError: division by zero',
            errorCount: 3,
            taskTitle: 'Build Python Calculator',
          },
        }),
      });

      const data = await res.json();
      const responseText =
        data.liveResponse?.assistantResponse ||
        "I'm continuously monitoring your Python Calculator workspace.";

      setAiResponse(responseText);
      setHistory((prev) => [...prev, { sender: 'ai', text: responseText }]);
      setState('Speaking');
      speakText(responseText);
    } catch (err) {
      console.error(err);
      setState('Ready');
    }
  };

  return (
    <AppShell>
      <div className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2338] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                Multimodal Voice Interface
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Gemini 3.8 Live
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
              Voice Command Center
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Talk naturally with First Sight about your active codebase, blockers, and test suite.
            </p>
          </div>
        </div>

        {/* Center Microphone & Waveform Card */}
        <div className="p-8 rounded-2xl bg-[#0C0E1B] border border-[#212740] shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#131627] border border-[#262B44] text-xs font-mono">
            <Radio className={`w-3.5 h-3.5 ${state === 'Listening' ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
            <span className="text-gray-300 font-semibold">State: {state.toUpperCase()}</span>
          </div>

          {/* Large Interactive Microphone Button */}
          <button
            onClick={handleStartListening}
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              state === 'Listening'
                ? 'bg-red-500 shadow-red-500/50 scale-105 animate-pulse'
                : state === 'Speaking'
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/40'
                : 'bg-gradient-to-tr from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-blue-500/30 hover:scale-105'
            }`}
          >
            {state === 'Listening' ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>

          {/* Waveform Visualizer */}
          <div className="flex items-center gap-1.5 h-16 justify-center">
            {waveformBars.map((height, idx) => (
              <div
                key={idx}
                className="w-1.5 rounded-full bg-gradient-to-t from-blue-600 to-violet-400 transition-all duration-100"
                style={{ height: `${height}%` }}
              ></div>
            ))}
          </div>

          {/* Live Transcription Box */}
          <div className="w-full max-w-lg p-3 rounded-xl bg-[#080A14] border border-[#1A1E32] text-xs font-mono text-gray-400">
            <span className="text-gray-500 uppercase font-semibold">Live Transcription: </span>
            <span className="text-white">{transcript || 'Click mic and speak...'}</span>
          </div>

          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-gray-500">Try asking:</span>
            <button
              onClick={() => handleSampleQuery('Why am I stuck?')}
              className="px-3 py-1.5 rounded-lg bg-[#141828] border border-[#232840] hover:border-blue-500 text-xs text-blue-300 transition-colors"
            >
              "Why am I stuck?"
            </button>
            <button
              onClick={() => handleSampleQuery('What is the test status?')}
              className="px-3 py-1.5 rounded-lg bg-[#141828] border border-[#232840] hover:border-blue-500 text-xs text-blue-300 transition-colors"
            >
              "What is the test status?"
            </button>
            <button
              onClick={() => handleSampleQuery('Can you fix the division error?')}
              className="px-3 py-1.5 rounded-lg bg-[#141828] border border-[#232840] hover:border-blue-500 text-xs text-blue-300 transition-colors"
            >
              "Can you fix the division error?"
            </button>
          </div>
        </div>

        {/* Conversation History Stream */}
        <div className="p-6 rounded-2xl bg-[#0B0D18] border border-[#1E2338] shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Voice Conversation Session
          </h3>

          <div className="space-y-3">
            {history.map((msg, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-3 ${
                  msg.sender === 'ai'
                    ? 'bg-[#101424] border border-blue-500/25 text-gray-200'
                    : 'bg-[#181B2B] text-gray-300 ml-8'
                }`}
              >
                <div className="mt-0.5">
                  {msg.sender === 'ai' ? (
                    <Bot className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    <User className="w-4 h-4 text-violet-400 shrink-0" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block mb-0.5">
                    {msg.sender === 'ai' ? 'First Sight (Gemini Live)' : 'You'}
                  </span>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
