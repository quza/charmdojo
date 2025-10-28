'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { SuccessMeter } from './SuccessMeter';
import { GameOverOverlay } from './GameOverOverlay';
import { VictoryOverlay } from './VictoryOverlay';
import { FloatingXpBubble } from '@/components/game/FloatingXpBubble';
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
  
  // XP bubble state
  const [xpBubbles, setXpBubbles] = useState<Array<{ id: string; xp: number }>>([]);
  
  // Use game store instead of local state
  const {
    messages,
    currentMeter,
    gameStatus,
    isWonThisSession,
    isLoading,
    error,
    initializeRound,
    addOptimisticMessage,
    removeOptimisticMessage,
    addMessages,
    updateSuccessMeter,
    updateMessageStatus,
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
      status: 'sending',
    };
    
    addOptimisticMessage(userMessage);
    
    const startTime = Date.now();
    
    // Start API call immediately (AI generates in background)
    const apiPromise = fetch('/api/chat/message', {
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
    
    // Schedule "Read" indicator after 1 second
    setTimeout(() => {
      updateMessageStatus(userMessage.id, 'read');
    }, 1000);
    
    // Schedule typing indicator after 2 seconds
    setTimeout(() => {
      setLoading(true);
    }, 2000);
    
    try {
      const response = await apiPromise;
      
      // Calculate elapsed time
      const elapsed = Date.now() - startTime;
      const minDelay = 3000; // 3 seconds total minimum
      
      // Wait for remaining time if response came too quickly
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }
      
      if (!response.ok) {
        const data = await response.json();
        
        // Handle ghosting
        if (data.ghosted) {
          removeOptimisticMessage(userMessage.id);
          if (data.userMessage) {
            addOptimisticMessage(data.userMessage);
          }
          updateSuccessMeter(data.successMeter?.delta || -currentMeter, 0);
          setGameStatus('lost', 'You got ghosted...');
          setLoading(false);
          return;
        }
        
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
        
        // Handle quota exceeded (429)
        if (response.status === 429) {
          removeOptimisticMessage(userMessage.id);
          toast.error(data.error || 'AI quota exceeded. Please check your OpenAI billing.');
          setLoading(false);
          return;
        }
        
        throw new Error(data.error || 'Failed to send message');
      }
      
      const data: ChatMessageResponse = await response.json();
      
      // Handle ghosting in successful responses
      if (data.ghosted) {
        removeOptimisticMessage(userMessage.id);
        addOptimisticMessage(data.userMessage);
        updateSuccessMeter(data.successMeter.delta, 0);
        setGameStatus('lost', 'You got ghosted...');
        setLoading(false);
        return;
      }
      
      // Handle normal responses (check if aiResponse exists)
      if (data.aiResponse) {
        removeOptimisticMessage(userMessage.id);
        
        // If multiple messages, add them all with stagger
        if (data.multipleMessages && data.multipleMessages.length > 1) {
          addMessages(data.userMessage, data.aiResponse);
          
          // Add follow-up messages after a delay
          for (let i = 1; i < data.multipleMessages.length; i++) {
            setTimeout(() => {
              const followUpMessage: Message = {
                id: `followup_${Date.now()}_${i}`,
                role: 'assistant',
                content: data.multipleMessages![i],
                timestamp: new Date().toISOString(),
              };
              addOptimisticMessage(followUpMessage);
            }, i * 800); // 800ms between each follow-up
          }
        } else {
          addMessages(data.userMessage, data.aiResponse);
        }
        
        // Update success meter
        updateSuccessMeter(data.successMeter.delta, data.successMeter.current);
        
        // Show XP bubble if XP was gained
        if (data.xpGained && data.xpGained > 0) {
          const bubbleId = `xp_${Date.now()}`;
          setXpBubbles(prev => [...prev, { id: bubbleId, xp: data.xpGained! }]);
        }
        
        // Check game status
        if (data.gameStatus === 'won') {
          setGameStatus('won');
        } else if (data.gameStatus === 'lost') {
          setGameStatus('lost', 'Success meter dropped too low');
        }
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
      {/* Phone Frame Container - wrapper that grows with content */}
      <div className="relative w-full max-w-md">
        {/* Wrapper for gradient border effect - grows with content */}
        <div className="relative p-1">
          {/* Gradient border frame - positioned behind content */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-accent rounded-3xl blur-sm opacity-75" />
          
          {/* Main phone content - Dynamic height: fixed during gameplay, auto when won */}
          <div className={`relative bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col ${gameStatus === 'won' ? 'min-h-[700px] h-auto' : 'h-[700px]'}`}>
          
          {/* Show chat interface only when game is active or lost */}
          {gameStatus !== 'won' && (
            <>
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
          
          {/* Game Over Overlay */}
          {gameStatus === 'lost' && (
            <GameOverOverlay roundId={roundId} />
          )}
          </>
          )}
          
          {/* Victory Overlay - only render if won in THIS session (not from persisted state) */}
          {gameStatus === 'won' && isWonThisSession && (
            <VictoryOverlay roundId={roundId} />
          )}
        </div>
        </div>
        
        {/* Floating XP Bubbles */}
        {xpBubbles.map(bubble => (
          <FloatingXpBubble
            key={bubble.id}
            xp={bubble.xp}
            onComplete={() => {
              setXpBubbles(prev => prev.filter(b => b.id !== bubble.id));
            }}
          />
        ))}
      </div>
    </div>
  );
}

