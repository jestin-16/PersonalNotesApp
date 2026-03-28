import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: { sourceId: string; title: string; text: string }[];
}

interface AIChatProps {
  selectedNotes: Note[];
}

export const AIChat: React.FC<AIChatProps> = ({ selectedNotes }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I can help you understand your sources. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const response: Message = {
        role: 'assistant',
        content: `Based on your ${selectedNotes.length} selected sources, I found that...`,
        citations: selectedNotes.length > 0 ? [
          { 
            sourceId: selectedNotes[0].id, 
            title: selectedNotes[0].title, 
            text: selectedNotes[0].content?.slice(0, 50) + "..." 
          }
        ] : []
      };
      
      if (selectedNotes.length === 0) {
        response.content = "I don't have any sources to base my answer on. Please select some notes as sources in the panel above.";
      } else {
        response.content = `Looking at "${selectedNotes[0].title}", it seems like you've been focused on this topic. The notes suggest a clear direction for the project.`;
      }

      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-slate-800">Notebook AI</h3>
        </div>
        <div className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider">
          {selectedNotes.length} Sources
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              m.role === 'assistant' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {m.role === 'assistant' ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className={`flex flex-col gap-2 max-w-[80%] ${m.role === 'user' ? 'items-end' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'assistant' 
                  ? 'bg-slate-50 text-slate-800 rounded-tl-none' 
                  : 'bg-blue-600 text-white rounded-tr-none'
              }`}>
                {m.content}
              </div>
              
              {m.citations && m.citations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {m.citations.map((c, ci) => (
                    <div key={ci} className="group relative">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] text-slate-500 hover:border-blue-300 transition-colors cursor-help">
                        <FileText className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">{c.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your notes..."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-sm"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bottom-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center uppercase tracking-widest font-semibold">
          AI can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
};
