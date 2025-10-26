import { ChatInterface } from '@/components/chat/ChatInterface';
import { Message, GirlProfile } from '@/types/chat';

// Mock data - will be replaced with real data from API
const mockGirl: GirlProfile = {
  name: 'Sophia',
  imageUrl: '/fallback-images/fallback-girls/sophia_1761428755603_mfsv0gjnll.png',
};

const mockMessages: Message[] = [
  {
    id: 'msg_1',
    role: 'assistant',
    content: "Hey! I noticed you like hiking in your photos 🏔️",
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
];

export default function ChatPage({ params }: { params: { roundId: string } }) {
  return (
    <ChatInterface 
      girl={mockGirl}
      initialMessages={mockMessages}
    />
  );
}
