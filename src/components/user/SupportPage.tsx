import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Copy, 
  Check, 
  MessageSquare, 
  HelpCircle, 
  ShieldAlert, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BRAND_CONFIG } from '../../../shared/types.ts';

export const SupportPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCopy = () => {
    navigator.clipboard.writeText(BRAND_CONFIG.supportWhatsApp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    {
      q: 'Is RITAM REVIEW AGENCY an educational simulator or a real review service?',
      a: 'This application is strictly an educational simulation laboratory for evaluating customer feedback dynamics, mock map user experience, and atomic task workflows. It does not publish, manipulate, or buy Google Maps reviews, nor does it conduct automated commercial transfers.'
    },
    {
      q: 'How does the atomic slot allocation and one-comment-one-user rule work?',
      a: 'When you click "CLAIM SIMULATION", an atomic database transaction locks 1 available comment from the task pool and binds it exclusively to your user ID. No other user can claim that specific comment, ensuring complete isolation.'
    },
    {
      q: 'How does the simulated wallet balance and withdrawal function?',
      a: 'Upon successful internal verification of your simulation exercise, the system issues a simulated reward credit to your wallet ledger. When you request a withdrawal, our administrative panel reviews the record.'
    },
    {
      q: 'What is the WhatsApp support helpline?',
      a: `Our official administrative support WhatsApp contact is ${BRAND_CONFIG.supportWhatsApp}. Please use this for all simulator technical inquiries.`
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
          OFFICIAL ASSISTANCE & GUIDELINES
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight">Support & Contact</h1>
        <p className="text-xs text-zinc-400">
          Dedicated technical guidance for participants of the {BRAND_CONFIG.name}
        </p>
      </div>

      {/* Main Support Contact Card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-3xl bg-zinc-100 text-zinc-950 flex items-center justify-center mx-auto shadow-xl">
          <Phone className="w-8 h-8 text-zinc-900" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">WhatsApp Support Helpline</h2>
          <div className="text-3xl font-black text-white mt-2 font-mono tracking-wider">
            {BRAND_CONFIG.supportWhatsApp}
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Available 10:00 AM - 08:00 PM IST for verification & simulation assistance
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={BRAND_CONFIG.whatsappDirectLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-100 text-zinc-950 hover:bg-white font-bold text-xs shadow-lg transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            CONTACT SUPPORT ON WHATSAPP
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors border border-zinc-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                NUMBER COPIED
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                COPY NUMBER
              </>
            )}
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-zinc-400" />
          <h3 className="text-lg font-bold text-white">Frequently Answered Questions</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/60 transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/80">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Strict Ethical Disclaimer */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-500 text-center leading-relaxed">
        {BRAND_CONFIG.disclaimer}
      </div>
    </div>
  );
};
