import { ChatInterface } from '@/components/chat/ChatInterface';
import { Message, GirlProfile } from '@/types/chat';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ChatPage({ params }: { params: Promise<{ roundId: string }> }) {
  const supabase = await createClient();

  // Await params for Next.js 15+ compatibility
  const { roundId } = await params;

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch round data
  const { data: round, error: roundError } = await supabase
    .from('game_rounds')
    .select('*')
    .eq('id', roundId)
    .eq('user_id', user.id)
    .single();

  if (roundError || !round) {
    redirect('/main-menu');
  }

  // Check if round is already completed
  if (round.result) {
    // Round is complete - redirect based on result
    if (round.result === 'win') {
      redirect(`/game/victory/${roundId}`);
    } else {
      redirect('/main-menu');
    }
  }

  // Fetch existing messages
  const { data: messagesData } = await supabase
    .from('messages')
    .select('*')
    .eq('round_id', roundId)
    .order('created_at', { ascending: true });

  // Convert database messages to Message type
  const messages: Message[] = (messagesData || []).map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: msg.created_at,
  }));

  // Prepare girl profile
  const girl: GirlProfile = {
    name: round.girl_name,
    imageUrl: round.girl_image_url,
    description: round.girl_description || undefined,
    persona: round.girl_persona || undefined,
  };

  // Get current meter (use final_meter if set, otherwise initial_meter)
  const currentMeter = round.final_meter ?? round.initial_meter;

  return (
    <ChatInterface 
      roundId={roundId}
      girl={girl}
      initialMessages={messages}
      initialMeter={currentMeter}
    />
  );
}
