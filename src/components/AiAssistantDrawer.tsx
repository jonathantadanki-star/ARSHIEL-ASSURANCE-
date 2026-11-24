import React, { useState } from 'react';
import { X, Send, Bot, ShieldAlert, Loader2 } from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const QUICK_PROMPTS = [
  'Which ISO standards apply to a Semiconductor Fab in Telangana?',
  'Explain Category 1 vs Category 3 Legal Authorization Control rules.',
  'List key environmental & safety legal frameworks for Andhra Pradesh.',
  'Draft a 5-Why root cause structure for a LOTO audit nonconformity.',
];

export function AiAssistantDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isoAssessments, legalRequirements, audits, capas, serviceAuthorizations, fetchWithAuth } = useAssurance();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Welcome to ARSHIEL AI ASSURANCE ASSISTANT. I can help you select ISO standards, interpret assessment clauses, review Indian Central/AP/Telangana legal compliance frameworks, draft HIRA/JSA/SOP outlines, analyze CAPA root causes, and check Legal Authorization Control restrictions.\n\nNote: All AI guidance is advisory and requires review by competent human personnel. I cannot issue official certificates or override Category 3 service restrictions.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const sendMessage = async (textToSend?: string) => {
    const content = (textToSend ?? input).trim();
    if (!content || loading) return;

    const updated: Message[] = [...messages, { role: 'user', text: content }];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const restrictedCount = serviceAuthorizations.filter((s) => s.approvalStatus === 'Blocked / Restricted').length;
      const unverifiedLegal = legalRequirements.filter(
        (l) => l.verificationStatus === 'UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED'
      ).length;
      const contextSummary = `Workspace Snapshot: ${isoAssessments.length} ISO assessments, ${legalRequirements.length} legal entries (${unverifiedLegal} unverified requiring official source check), ${audits.length} audits, ${capas.length} CAPAs, ${restrictedCount} blocked Category-3 restricted services.`;

      const res = await fetchWithAuth('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.slice(-10),
          contextSummary,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Assistant request failed');
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || 'No response received.' }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Error reaching ARSHIEL AI engine: ${err instanceof Error ? err.message : 'Unknown error'}. Please verify server connectivity.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[1px]">
      <div className="w-full max-w-lg bg-white dark:bg-[#0B1F3A] h-full border-l border-slate-200 dark:border-[#087BFF]/30 flex flex-col shadow-xl">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#087BFF]/25 flex items-center justify-between gap-4 bg-[#071329] text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <Bot className="w-5 h-5 text-[#F5B82E] shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-sm font-semibold truncate">ARSHIEL AI ASSURANCE ASSISTANT</h2>
              <p className="text-[11px] text-slate-400 truncate">Advisory AI · Competent Human Review Required</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI Assistant"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-700/40 flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            AI Safety Guard active: Never fabricates laws, audit evidence, or certificates, and cannot bypass Category 3 authorization restrictions.
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#071329] dark:bg-[#087BFF] text-white'
                    : 'bg-slate-50 dark:bg-[#071329]/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              Analyzing assurance frameworks...
            </div>
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#071329]/70">
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="text-left text-[11px] text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/15 hover:border-slate-400 rounded-md px-2.5 py-1 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ISO clauses, Indian legal compliance, HIRA, CAPA..."
              className="flex-1 px-3.5 py-2 text-sm bg-white dark:bg-[#0B1F3A] dark:text-white border border-slate-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-slate-900"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-[#071329] hover:bg-[#087BFF] text-white text-sm font-medium rounded-lg disabled:opacity-50 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
