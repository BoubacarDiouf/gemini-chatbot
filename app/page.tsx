
'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export default function Chat() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, status, error } = useChat();

  const isChatLoading =
    status === 'submitted' || status === 'streaming';

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isChatLoading) return;

    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
      <header className="flex items-center px-6 py-4 bg-slate-800 border-b border-slate-700 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Sparkles size={22} />
          </div>

          <div>
            <h1 className="font-bold text-lg tracking-wide">
              Gemini Chatbot
            </h1>

            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              En ligne
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4 max-w-3xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="p-4 bg-slate-800 rounded-full text-blue-400 border border-slate-700">
              <Bot size={40} />
            </div>

            <h2 className="text-xl font-semibold text-slate-200">
              Comment puis-je vous aider aujourd'hui ?
            </h2>

            <p className="text-sm text-slate-400 max-w-sm">
              Posez-moi n'importe quelle question. Je suis propulsé par
              Google Gemini.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-4 p-4 rounded-xl border ${
                m.role === 'user'
                  ? 'bg-blue-600/10 border-blue-500/20'
                  : 'bg-slate-800/50 border-slate-700/50'
              }`}
            >
              <div
                className={`p-2 rounded-lg h-10 w-10 flex items-center justify-center shrink-0 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-blue-400'
                }`}
              >
                {m.role === 'user' ? (
                  <User size={20} />
                ) : (
                  <Bot size={20} />
                )}
              </div>

              <div className="flex-1 pt-1 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {m.parts.map((part, index) =>
                  part.type === 'text' ? (
                    <span key={index}>{part.text}</span>
                  ) : null
                )}
              </div>
            </div>
          ))
        )}

        {isChatLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-4 p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl">
            <div className="p-2 rounded-lg bg-slate-700 text-blue-400 h-10 w-10 flex items-center justify-center">
              <Bot size={20} />
            </div>

            <div className="flex items-center gap-1 pt-2">
              <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" />
              <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-900/30 border border-red-700 text-red-300 text-sm">
            Erreur : {error.message}
          </div>
        )}
      </main>

      <footer className="p-4 bg-slate-900 border-t border-slate-800 max-w-3xl w-full mx-auto">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
            value={input}
            placeholder="Posez votre question ici..."
            onChange={(e) => setInput(e.target.value)}
            disabled={isChatLoading}
          />

          <button
            type="submit"
            disabled={!input.trim() || isChatLoading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all shadow-lg flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-500 mt-2">
        Bouba Diouf
        </p>
      </footer>
    </div>
  );
}
