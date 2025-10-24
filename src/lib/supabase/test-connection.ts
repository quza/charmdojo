import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
export async function testConnection() {
  const { data, error } = await supabase.from('_test').select('*').limit(1);
  if (error && error.code !== 'PGRST116') { // PGRST116 = table not found (expected)
    console.error('Supabase connection error:', error);
    return false;
  }
  console.log('✅ Supabase connected successfully');
  return true;
}
