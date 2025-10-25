import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check if user is already authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is already authenticated, redirect to main menu
    redirect('/main-menu');
  }

  return (
    <div className="min-h-screen bg-[#04060c] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#e15f6e] mb-2">CharmDojo</h1>
          <p className="text-sm text-gray-400">
            Elevate your texting skills
          </p>
        </div>

        {/* Content card with animated gradient border and glow */}
        <div className="relative p-[3px] rounded-lg bg-gradient-to-r from-[#ff1744] via-[#ff9100] via-[#e15f6e] via-[#9c27b0] to-[#ff1744] bg-[length:400%_400%] animate-[gradient-flow_5s_ease-in-out_infinite] shadow-[0_0_30px_rgba(255,23,68,0.6),0_0_60px_rgba(225,95,110,0.4)]">
          <div className="bg-[#0a0d16] rounded-lg p-8">
            {children}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

