import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, Check, RefreshCw, AlertCircle } from 'lucide-react';

interface CommandCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  contextData: any;
}

export const CommandCopilotDrawer: React.FC<CommandCopilotDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  contextData,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        'Greetings. I am **Eventos Command Copilot**. I have live context on active events, budget allocations, staff shifts, and inventory status. How can I assist with your operations today?',
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Analyze Riyadh Gala high-risk milestones & security protocols',
    'How should we resolve Crew A double-booking conflict on Nov 15?',
    'Review budget cost variance (+14.2%) on Staging Trussing contract',
    'Draft a concise vendor RFP for Aramco Energy Forum Laser setup',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || prompt;
    if (!query.trim()) return;

    const userMsg = { role: 'user' as const, content: query };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, context: contextData }),
      });

      const contentType = res.headers.get('content-type');
      let data: any = null;
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        throw new Error(data?.error || `AI Copilot request failed (HTTP ${res.status})`);
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data?.text || 'No response generated.' },
      ]);
    } catch (err: any) {
      console.error('Copilot Fetch Error:', err);
      setError(err?.message || 'Error communicating with AI Copilot');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ **API Connection Error**: ' +
            (err?.message || 'Failed to reach AI Copilot server. Ensure GEMINI_API_KEY is configured.'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-950/85 backdrop-blur-2xl border-l border-white/15 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03] backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-md border border-white/20">
              <Sparkles className="w-4 h-4 fill-slate-950 stroke-none animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                AI Command Copilot
                <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
                  Gemini 2.5
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Live Operations & Risk Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Trigger Chips */}
        <div className="p-3 bg-white/[0.02] border-b border-white/10 overflow-x-auto flex gap-2 no-scrollbar backdrop-blur-md">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap glass-btn text-indigo-200 hover:text-white px-3 py-1.5 rounded-full transition-all shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'glass-btn-primary text-slate-100 font-medium rounded-br-none shadow-lg'
                    : 'glass-card border-white/10 text-slate-200 rounded-bl-none shadow-md bg-white/[0.04]'
                }`}
              >
                <div
                  className="prose prose-invert prose-xs whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-xs py-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span className="italic">Analyzing operational context & generating response...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-white/10 bg-white/[0.02] backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Copilot about risks, shifts, budgets..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400/80"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="glass-btn-primary hover:scale-105 disabled:opacity-50 text-slate-100 font-bold p-2.5 rounded-xl transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
