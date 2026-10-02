import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, Edit3, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api.ts';

interface AiSampleGeneratorProps {
  businessName?: string;
  businessType?: string;
  onSelectSample?: (sampleText: string) => void;
}

export const AiSampleGenerator: React.FC<AiSampleGeneratorProps> = ({
  businessName = 'ABC Enterprises',
  businessType = 'retail',
  onSelectSample
}) => {
  const [bName, setBName] = useState(businessName);
  const [bType, setBType] = useState(businessType);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedSample, setGeneratedSample] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{
        success: boolean;
        sample_comment: string;
        disclaimer: string;
      }>('/api/ai/generate-sample', {
        method: 'POST',
        body: JSON.stringify({
          business_name: bName,
          business_type: bType,
          context_notes: notes
        })
      });
      setGeneratedSample(res.sample_comment);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to generate sample');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedSample) return;
    navigator.clipboard.writeText(generatedSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onSelectSample && generatedSample) {
      onSelectSample(generatedSample);
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold shadow-lg">
            <Sparkles className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">AI Educational Sample Generator</h3>
            <p className="text-xs text-zinc-400">Generate fictional, objective review samples for simulator tasks</p>
          </div>
        </div>
        <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
          Powered by Gemini
        </span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Business Name</label>
          <input
            type="text"
            value={bName}
            onChange={(e) => setBName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
            placeholder="e.g. ABC Enterprises"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category</label>
          <select
            value={bType}
            onChange={(e) => setBType(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
          >
            <option value="retail">Retail & Electronics Store</option>
            <option value="hospitality">Restaurant & Dining Service</option>
            <option value="digital">Digital Agency & Tech Consultancy</option>
            <option value="healthcare">Clinic & Diagnostics Centre</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Optional Context or Training Tone</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
            placeholder="e.g. Focus on billing accuracy and polite staff demeanor"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white font-semibold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Educational Sample...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              GENERATE SAMPLE
            </>
          )}
        </button>

        {generatedSample && (
          <>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              REGENERATE
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'DONE EDITING' : 'EDIT'}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Generated Box */}
      {generatedSample && (
        <div className="space-y-3 pt-2">
          {/* Mandatory Safety Notice as specified in brief */}
          <div className="px-3.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-bold text-amber-400 tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            SIMULATED SAMPLE — NOT FOR REAL-WORLD POSTING
          </div>

          <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5">
            {isEditing ? (
              <textarea
                value={generatedSample}
                onChange={(e) => setGeneratedSample(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-sm text-zinc-100 focus:outline-none resize-none leading-relaxed"
              />
            ) : (
              <p className="text-sm text-zinc-200 leading-relaxed font-sans">{generatedSample}</p>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/80">
              <span className="text-[11px] text-zinc-500">Character count: {generatedSample.length}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Sample
                    </>
                  )}
                </button>
                {onSelectSample && (
                  <button
                    onClick={handleApply}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-200 text-zinc-950 hover:bg-white text-xs font-semibold transition-colors"
                  >
                    Use in Simulation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
