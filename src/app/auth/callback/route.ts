import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get('redirect_to') ?? '/main-menu';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Successful authentication - redirect to intended destination with refresh flag
      const finalRedirect = new URL(redirectTo, origin);
      finalRedirect.searchParams.set('refresh', 'true');
      return NextResponse.redirect(finalRedirect);
    }
  }

  // If there's an error or no code, redirect to login with error message
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}

