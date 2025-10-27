/**
 * Girl Pool Service
 * 
 * Manages the pre-generated pool of girl profiles (target: 2000)
 * Provides functions to add, retrieve, and track usage of girl profiles
 * Use Supabase MCP for database operations
 */

import { createClient } from '@/lib/supabase/server';

export interface GirlProfile {
  id: string;
  name: string;
  image_url: string;
  ethnicity: string;
  hairstyle: string;
  haircolor: string;
  eyecolor: string;
  bodytype: string;
  setting: string;
  source: 'imagen' | 'placeholder' | 'fallback';
  generation_prompt: string | null;
  use_count: number;
  last_used_at: string | null;
  created_at: string;
}

/**
 * Get current size of girl profiles pool
 * Use Supabase MCP
 */
export async function getPoolSize(): Promise<number> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_girl_pool_size');
    
    if (error) {
      console.error('❌ Error getting pool size:', error);
      return 0;
    }
    
    return data || 0;
  } catch (error) {
    console.error('❌ Exception getting pool size:', error);
    return 0;
  }
}

/**
 * Add a newly generated girl to the pool
 * Use Supabase MCP
 */
export async function addGirlToPool(
  girl: {
    name: string;
    image_url: string;
    attributes: {
      ethnicity: string;
      hairstyle: string;
      haircolor: string;
      eyecolor: string;
      bodytype: string;
      setting: string;
    };
    source: 'imagen' | 'placeholder' | 'fallback';
    generation_prompt?: string;
  }
): Promise<GirlProfile | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('girl_profiles')
      .insert({
        name: girl.name,
        image_url: girl.image_url,
        ethnicity: girl.attributes.ethnicity,
        hairstyle: girl.attributes.hairstyle,
        haircolor: girl.attributes.haircolor,
        eyecolor: girl.attributes.eyecolor,
        bodytype: girl.attributes.bodytype,
        setting: girl.attributes.setting,
        source: girl.source,
        generation_prompt: girl.generation_prompt || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error adding girl to pool:', error);
      return null;
    }
    
    console.log(`✅ Added ${girl.name} to pool (source: ${girl.source})`);
    return data as GirlProfile;
  } catch (error) {
    console.error('❌ Exception adding girl to pool:', error);
    return null;
  }
}

/**
 * Get N random unique girls from pool
 * Use Supabase MCP
 */
export async function getRandomGirlsFromPool(count: number = 3): Promise<GirlProfile[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_random_girls', { count });
    
    if (error) {
      console.error('❌ Error getting random girls:', error);
      return [];
    }
    
    return (data as GirlProfile[]) || [];
  } catch (error) {
    console.error('❌ Exception getting random girls:', error);
    return [];
  }
}

/**
 * Update usage stats when a girl is selected
 * Use Supabase MCP
 */
export async function markGirlAsUsed(girlId: string): Promise<void> {
  try {
    const supabase = await createClient();
    
    // First get the current count
    const { data: currentData, error: fetchError } = await supabase
      .from('girl_profiles')
      .select('use_count')
      .eq('id', girlId)
      .single();
    
    if (fetchError) {
      console.error('⚠️ Error fetching girl use_count:', fetchError);
      return;
    }
    
    const newCount = (currentData?.use_count || 0) + 1;
    
    // Update with new count
    const { error } = await supabase
      .from('girl_profiles')
      .update({
        last_used_at: new Date().toISOString(),
        use_count: newCount,
      })
      .eq('id', girlId);
    
    if (error) {
      console.error('⚠️ Error marking girl as used:', error);
    }
  } catch (error) {
    console.error('⚠️ Exception marking girl as used:', error);
  }
}

/**
 * Get pool statistics
 */
export async function getPoolStats(): Promise<{
  total: number;
  bySource: { imagen: number; placeholder: number; fallback: number };
}> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('girl_profiles')
      .select('source');
    
    if (error) {
      console.error('❌ Error getting pool stats:', error);
      return { total: 0, bySource: { imagen: 0, placeholder: 0, fallback: 0 } };
    }
    
    const bySource = {
      imagen: data.filter((g: any) => g.source === 'imagen').length,
      placeholder: data.filter((g: any) => g.source === 'placeholder').length,
      fallback: data.filter((g: any) => g.source === 'fallback').length,
    };
    
    return {
      total: data.length,
      bySource,
    };
  } catch (error) {
    console.error('❌ Exception getting pool stats:', error);
    return { total: 0, bySource: { imagen: 0, placeholder: 0, fallback: 0 } };
  }
}

