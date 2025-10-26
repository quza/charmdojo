'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Message, GirlProfile } from '@/types/chat';

interface ChatInterfaceProps {
  girl: GirlProfile;
  initialMessages: Message[];
}

export function ChatInterface({ girl, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simulate AI response (mock for now)
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: 'This is a mock response. API integration will be added in a later step! 😊',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      {/* Phone Frame Container */}
      <div className="relative w-full max-w-md">
        {/* Gradient border frame */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-accent rounded-3xl blur-sm opacity-75" />
        
        {/* Main phone content */}
        <div className="relative bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col" style={{ height: '700px' }}>
          {/* Header */}
          <ChatHeader girlName={girl.name} girlImageUrl={girl.imageUrl} />
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                girlImageUrl={message.role === 'assistant' ? girl.imageUrl : undefined}
              />
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/30 flex-shrink-0">
                  <img src={girl.imageUrl} alt="Girl" className="w-full h-full object-cover" />
                </div>
                <div className="bg-white/5 text-white border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}

