import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, RefreshCw, Bot, User, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { CoachChatMessage } from '../types';

interface CoachChatProps {
  chatMessages: CoachChatMessage[];
  isChatLoading: boolean;
  onSendMessage: (text: string) => Promise<void>;
}

export function CoachChat({ chatMessages, isChatLoading, onSendMessage }: CoachChatProps) {
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;
    
    const messageText = input.trim();
    setInput('');
    await onSendMessage(messageText);
  };

  const handleQuickPrompt = async (promptText: string) => {
    if (isChatLoading) return;
    await onSendMessage(promptText);
  };

  const starterPrompts = [
    { text: 'Explain my diet category impact', label: 'Diet insights' },
    { text: 'Why is transport impact higher than recycling?', label: 'Travel science' },
    { text: 'How do I double my streak points?', label: 'Streak rules' }
  ];

  return (
    <div id="eco-coach-chat-widget" className="bg-white border border-slate-100 rounded-3xl overflow-hidden flex flex-col h-[520px] sm:h-[550px] shadow-sm select-none text-slate-800">
      
      {/* 1. Header */}
      <div className="bg-slate-50 border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              EcoMind Coach AI
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <p className="text-[9px] text-slate-400">Personalized carbon science guide</p>
          </div>
        </div>
        <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider">
          <Sparkles className="w-2.5 h-2.5" />
          Online
        </span>
      </div>

      {/* 2. Messages viewport */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-none">
        <AnimatePresence initial={false}>
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar representation */}
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                msg.sender === 'user'
                  ? 'bg-slate-100 border-slate-200 text-slate-600'
                  : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}>
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message text bubble */}
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs leading-normal ${
                msg.sender === 'user'
                  ? 'bg-emerald-500 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none font-medium text-left'
              }`}>
                {msg.sender === 'coach' ? (
                  <div className="markdown-body space-y-1.5 max-w-none text-slate-700">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                )}
                
                <span className={`block text-[8px] mt-1 font-mono text-right shrink-0 select-none ${
                  msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                }`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
          
          {/* Typings */}
          {isChatLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg border bg-emerald-50 border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 animate-spin-slow">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                <span className="ml-1 text-[10px] text-slate-450 italic">Coach is calculating offsets...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {chatMessages.length <= 1 && !isChatLoading && (
          <div className="pt-2 space-y-2.5" id="quick-starters-frame">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Suggested queries</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(p.text)}
                  className="bg-white hover:bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-left text-[11px] text-slate-600 transition-all cursor-pointer"
                >
                  <p className="font-bold text-[9px] text-emerald-600 mb-0.5 uppercase tracking-wide">{p.label}</p>
                  <p className="line-clamp-2 leading-snug">{p.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input form */}
      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            id="coach-chat-input"
            aria-label="Type your message to the Sustainability Coach"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isChatLoading}
            placeholder={isChatLoading ? "Calculating baseline tradeoffs..." : "Ask your coach... (e.g. Diet versus flying)"}
            className="flex-1 h-11 bg-white border border-slate-200/90 focus:border-emerald-400 rounded-xl px-3.5 pr-12 text-xs text-slate-705 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isChatLoading}
            className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center absolute right-1.5 top-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[9px] text-slate-400 text-center mt-2">
          Dynamic answers mapped side-by-side to your recorded carbon stats.
        </p>
      </div>

    </div>
  );
}
