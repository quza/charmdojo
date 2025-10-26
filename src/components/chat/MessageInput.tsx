'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 border-t border-white/10 bg-neutral-900/50"
    >
      <div className="flex gap-2 items-end">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Message"
          rows={1}
          maxLength={500}
          className="flex-1 bg-white/5 text-white placeholder:text-white/40 border border-white/10 rounded-full px-4 py-2 text-sm resize-none focus:outline-none focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed max-h-36 custom-scrollbar"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-accent text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}

