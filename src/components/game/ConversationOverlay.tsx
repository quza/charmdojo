'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Loader2, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { GameRound } from '@/types/game';
import type { Message } from '@/types/chat';

interface ConversationOverlayProps {
  round: GameRound | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationOverlay({ round, isOpen, onClose }: ConversationOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages when overlay opens
  useEffect(() => {
    if (!round || !isOpen) {
      setMessages([]);
      setError(null);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/chat/messages/${round.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        
        // Transform messages to match Message interface
        const transformedMessages: Message[] = (data.messages || []).map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || msg.created_at,
        }));

        setMessages(transformedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [round, isOpen]);

  if (!round) return null;

  const isWin = round.result === 'win';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        'max-w-2xl h-[85vh] p-0 gap-0 flex flex-col',
        'bg-gradient-to-br from-[#04060c] to-[#0a0d1a]',
        'border border-[#e15f6e]/30'
      )}>
        {/* Header with Girl Profile */}
        <DialogHeader className="shrink-0 p-6 pb-4 border-b border-[#e15f6e]/20">
          <div className="flex items-center gap-4">
            {/* Girl Image */}
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-[#e15f6e]">
              <Image
                src={round.girlImageUrl}
                alt={round.girlName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

            {/* Girl Info */}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-white mb-1 truncate">
                {round.girlName}
              </DialogTitle>
              <div className="flex items-center gap-3 text-sm flex-wrap">
                {/* Result Badge */}
                <span className={cn(
                  'flex items-center gap-1 font-semibold',
                  isWin ? 'text-green-400' : 'text-red-400'
                )}>
                  {isWin ? (
                    <>
                      <Trophy className="size-3.5" />
                      Win
                    </>
                  ) : (
                    <>
                      <X className="size-3.5" />
                      Loss
                    </>
                  )}
                </span>
                
                {/* Message Count */}
                <span className="text-white/60">
                  {round.messageCount} messages
                </span>

                {/* Final Meter (if win) */}
                {isWin && (
                  <span className="text-green-400 font-semibold">
                    {round.finalMeter}% ❤️
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Messages Container - Scrollable */}
        <div className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 min-h-0",
          // Custom scrollbar styling
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#e15f6e]/50",
          "hover:scrollbar-thumb-[#e15f6e]/70",
          "[&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-[#e15f6e]/50",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:border-2",
          "[&::-webkit-scrollbar-thumb]:border-transparent",
          "hover:[&::-webkit-scrollbar-thumb]:bg-[#e15f6e]/70"
        )}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="size-8 animate-spin text-[#e15f6e]" />
              <p className="text-white/60">Loading conversation...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-red-400">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-white/60">No messages found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  girlImageUrl={round.girlImageUrl}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer with Result Summary */}
        {!loading && !error && (
          <div className={cn(
            'shrink-0 p-4 border-t',
            isWin 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          )}>
            <p className={cn(
              'text-center font-semibold',
              isWin ? 'text-green-400' : 'text-red-400'
            )}>
              {isWin 
                ? `🎉 Victory! You reached ${round.finalMeter}% success` 
                : '💔 Game Over - Better luck next time!'
              }
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


