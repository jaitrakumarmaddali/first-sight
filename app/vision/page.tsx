'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  Eye,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileImage,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function VisionPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const sampleMockupUrl = '/mockup-preview.png';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage || 'sample_ui_mockup',
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error('Vision analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2338] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-violet-400 font-semibold">
                Multimodal Vision Inspector
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">
                Gemini Omni Flash
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
              UI Vision Inspection
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Upload a workspace screenshot to detect layout collisions, button overlaps, and accessibility warnings.
            </p>
          </div>
        </div>

        {/* Upload & Preview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Upload Box */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0B0D18] border border-[#1E2338] shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Upload Workspace Screenshot
              </h3>

              <div className="border-2 border-dashed border-[#242A44] hover:border-violet-500/50 rounded-xl p-8 text-center flex flex-col items-center justify-center transition-colors">
                <FileImage className="w-12 h-12 text-violet-400/60 mb-3" />
                <p className="text-xs text-gray-300 font-medium">
                  Drag and drop screenshot, or browse
                </p>
                <p className="text-[11px] text-gray-500 mt-1 font-mono">
                  PNG, JPG, WebP up to 10MB
                </p>

                <label className="mt-4 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow cursor-pointer transition-colors">
                  <span>Select Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sample Quick Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500">Or use workspace snapshot:</span>
                <button
                  onClick={() => {
                    setSelectedImage('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60');
                    setAnalysisResult(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#141829] border border-[#232840] hover:border-violet-500 text-xs text-violet-300 transition-colors"
                >
                  Load Sample Python IDE Screenshot
                </button>
              </div>

              {/* Image Preview */}
              {selectedImage && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-[#252A42] max-h-64 bg-black">
                    <img
                      src={selectedImage}
                      alt="Workspace Screenshot Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gemini Omni Flash Inspecting...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Run Omni Flash Vision Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Analysis Results */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0B0D18] border border-[#1E2338] shadow-xl space-y-4 h-full">
              <div className="flex items-center justify-between border-b border-[#1A1F33] pb-3">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>Omni Flash Findings</span>
                </h3>
                {analysisResult && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                    {Math.round(analysisResult.confidence * 100)}% Confidence
                  </span>
                )}
              </div>

              {!analysisResult ? (
                <div className="p-12 text-center text-xs text-gray-500 space-y-2">
                  <Eye className="w-8 h-8 text-gray-600 mx-auto" />
                  <p>Select or upload a screenshot to inspect visual defects.</p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  {/* Summary & Explanation */}
                  <div className="p-3.5 rounded-xl bg-[#121626] border border-[#212740] space-y-2">
                    <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                      Visual Assessment
                    </span>
                    <p className="text-xs text-gray-200 leading-relaxed">
                      {analysisResult.explanation}
                    </p>
                  </div>

                  {/* Detected Issues */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Detected Visual Issues ({analysisResult.issuesDetected?.length || 0})
                    </span>

                    {analysisResult.issuesDetected?.map((issue: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#0F1220] border border-[#232840] space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>{issue.title}</span>
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase border ${
                              issue.severity === 'HIGH'
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">{issue.description}</p>
                        <span className="text-[10px] text-blue-400 font-mono block pt-0.5">
                          Location: {issue.location}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Suggested Fix */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Recommended UI Remedy</span>
                    </span>
                    <p className="text-emerald-200 text-xs leading-relaxed">
                      {analysisResult.suggestedFix}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
