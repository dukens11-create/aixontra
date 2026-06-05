'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';
import type { LiveChatMessage } from '@/lib/livestream/types';

interface LiveChatSidebarProps {
  messages: LiveChatMessage[];
  onSend: (content: string) => void;
  onClose?: () => void;
  streamId: string;
}

export function LiveChatSidebar({ messages, onSend, onClose }: LiveChatSidebarProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex h-full flex-col bg-black/60 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="text-sm font-semibold text-white">Live Chat</span>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-white/60 hover:text-white"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`text-sm ${msg.type === 'system' ? 'text-yellow-400' : msg.type === 'tip' ? 'text-emerald-400' : 'text-white/90'}`}
            >
              {msg.type !== 'system' && (
                <span className="font-semibold text-purple-300 mr-1">{msg.userName}:</span>
              )}
              {msg.content}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Say something..."
            maxLength={300}
            className="flex-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/40 outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            onClick={handleSend}
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-white hover:bg-purple-500 transition-colors"
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="mt-1 text-xs text-white/30">Be respectful · No spam</p>
      </div>
    </div>
  );
}
