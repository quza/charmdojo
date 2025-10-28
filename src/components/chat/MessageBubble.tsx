import Image from 'next/image';
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  girlImageUrl?: string;
}

export function MessageBubble({ message, girlImageUrl }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex flex-col gap-1 mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {/* Girl avatar for AI messages */}
        {!isUser && girlImageUrl && (
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/30 flex-shrink-0">
            <Image
              src={girlImageUrl}
              alt="Girl"
              fill
              className="object-cover"
            />
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
            isUser
              ? 'bg-gradient-to-r from-secondary to-accent text-white rounded-br-sm'
              : 'bg-white/5 text-white border border-white/10 rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        
        {/* Empty space for user messages to maintain alignment */}
        {isUser && <div className="w-8 flex-shrink-0" />}
      </div>
      
      {/* Read indicator for user messages */}
      {isUser && message.status === 'read' && (
        <div className="text-xs text-white/40 px-2">Read</div>
      )}
    </div>
  );
}

