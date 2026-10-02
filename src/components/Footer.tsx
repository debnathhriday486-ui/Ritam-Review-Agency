import React, { useState } from 'react';
import { BRAND_CONFIG } from '../../shared/types.ts';
import { Phone, Copy, Check, MessageSquare, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copySupportNumber = () => {
    navigator.clipboard.writeText(BRAND_CONFIG.supportWhatsApp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 mt-auto pb-16 md:pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">
                {BRAND_CONFIG.name}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {BRAND_CONFIG.subtitle}. An internal training simulator designed for analyzing customer sentiment, review structures, and verification workflows.
            </p>
          </div>

          {/* WhatsApp Support Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Website Support WhatsApp
            </h4>
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-white block">
                    {BRAND_CONFIG.supportWhatsApp}
                  </span>
                  <span className="text-[10px] text-zinc-400">Support & Inquiries</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={BRAND_CONFIG.whatsappDirectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>Message WhatsApp</span>
                </a>
                <button
                  onClick={copySupportNumber}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  title="Copy phone number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <a
              href={BRAND_CONFIG.whatsappDirectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat on WhatsApp Directly →
            </a>
          </div>

          {/* Legal / Simulation Guidelines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Educational Protocol
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {BRAND_CONFIG.disclaimer}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights reserved.</p>
          <p className="text-[11px] text-zinc-400 font-mono">
            Support WhatsApp: {BRAND_CONFIG.supportWhatsApp}
          </p>
        </div>
      </div>
    </footer>
  );
};
