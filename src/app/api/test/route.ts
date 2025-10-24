import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: users } = await supabase.from('users').select('*');
  const { data: rounds } = await supabase.from('game_rounds').select('*');
  return NextResponse.json({ users, rounds });
}
