import React, { useState } from 'react';
import { BRAND_CONFIG } from '../../shared/types.ts';
import {
  Phone,
  Copy,
  Check,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BRAND_CONFIG.supportWhatsApp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
          Customer Service & Educational Inquiries
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {BRAND_CONFIG.name} Support
        </h1>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Need assistance with your educational simulation tasks, atomic slots, or simulated wallet records? Reach our direct support desk.
        </p>
      </div>

      {/* Main Support Card */}
      <div className="p-6 sm:p-8 rounded-[18px] bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-700/80 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
          <Phone className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
            Official Support WhatsApp
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {BRAND_CONFIG.supportWhatsApp}
            </h2>
            <a
              href={BRAND_CONFIG.whatsappDirectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>MESSAGE WHATSAPP</span>
            </a>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Click &quot;MESSAGE WHATSAPP&quot; to open direct chat with auto-filled message: <br />
            <span className="font-mono text-emerald-400 font-semibold">&ldquo;HELLO SIR IAM COMMING FROM Ritam Review Agency WEBSITE&rdquo;</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={BRAND_CONFIG.whatsappDirectLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>MESSAGE WHATSAPP NOW</span>
          </a>

          <button
            onClick={handleCopy}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'NUMBER COPIED' : 'COPY NUMBER'}</span>
          </button>
        </div>
      </div>

      {/* FAQ & Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 space-y-2">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            <span>How does atomic slot allocation work?</span>
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            When you claim a simulation task, our backend locks a single unique comment from the pool. That comment can never be assigned to another participant.
          </p>
        </div>

        <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 space-y-2">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>Are any real Google Maps reviews posted?</span>
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Never. This application is an educational simulation sandbox. All reviews, map coordinates, and ratings are completely simulated inside this application.
          </p>
        </div>
      </div>
    </div>
  );
};
