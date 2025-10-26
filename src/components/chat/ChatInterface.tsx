'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { SuccessMeter } from './SuccessMeter';
import { GameOverOverlay } from './GameOverOverlay';
import { VictoryOverlay } from './VictoryOverlay';
import { Message, GirlProfile, ChatMessageResponse } from '@/types/chat';
import { useGame } from '@/hooks/useGame';

interface ChatInterfaceProps {
  roundId: string;
  girl: GirlProfile;
  initialMessages: Message[];
  initialMeter: number;
}

export function ChatInterface({ roundId, girl, initialMessages, initialMeter }: ChatInterfaceProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use game store instead of local state
  const {
    messages,
    currentMeter,
    gameStatus,
    isLoading,
    error,
    initializeRound,
    addOptimisticMessage,
    removeOptimisticMessage,
    addMessages,
    updateSuccessMeter,
    setGameStatus,
    setLoading,
    setError,
  } = useGame();
  
  // Initialize round data on mount
  useEffect(() => {
    initializeRound(roundId, girl, initialMessages, initialMeter);
  }, [roundId, girl, initialMessages, initialMeter, initializeRound]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (content: string) => {
    // Clear any previous error
    setError(null);
    
    // Add user message to UI immediately (optimistic update)
    const userMessage: Message = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    addOptimisticMessage(userMessage);
    setLoading(true);
    
    try {
      // Call the chat API
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId,
          message: content,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        
        // Handle instant fail (403)
        if (response.status === 403) {
          // Remove optimistic message and add actual one if available
          removeOptimisticMessage(userMessage.id);
          if (data.userMessage) {
            addOptimisticMessage(data.userMessage);
          }
          
          // Update meter to 0
          updateSuccessMeter(data.successMeter?.delta || -currentMeter, 0);
          
          // Set game status to lost
          setGameStatus('lost', data.failReason || 'Inappropriate content detected');
          setLoading(false);
          return;
        }
        
        throw new Error(data.error || 'Failed to send message');
      }
      
      const data: ChatMessageResponse = await response.json();
      
      // Remove optimistic message and add actual messages
      removeOptimisticMessage(userMessage.id);
      addMessages(data.userMessage, data.aiResponse);
      
      // Update success meter
      updateSuccessMeter(data.successMeter.delta, data.successMeter.current);
      
      // Check game status
      if (data.gameStatus === 'won') {
        setGameStatus('won');
      } else if (data.gameStatus === 'lost') {
        setGameStatus('lost', 'Success meter dropped too low');
      }
      
      setLoading(false);
      
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      
      // Remove the temporary user message on error
      removeOptimisticMessage(userMessage.id);
      setLoading(false);
    }
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
          
          {/* Success Meter - now reads from store */}
          <SuccessMeter />
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                girlImageUrl={message.role === 'assistant' ? girl.imageUrl : undefined}
              />
            ))}
            
            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            
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
          <MessageInput onSendMessage={handleSendMessage} disabled={isLoading || gameStatus !== 'active'} />
          
          {/* Game Over Overlay - now reads from store */}
          {gameStatus === 'lost' && (
            <GameOverOverlay roundId={roundId} />
          )}
          
          {/* Victory Overlay */}
          {gameStatus === 'won' && (
            <VictoryOverlay roundId={roundId} />
          )}
        </div>
      </div>
    </div>
  );
}

