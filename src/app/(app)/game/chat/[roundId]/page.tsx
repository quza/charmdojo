'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params.roundId as string;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#04060c] px-4">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-[#e15f6e]/10">
          <MessageCircle className="size-8 text-[#e15f6e]" />
        </div>

        {/* Coming Soon Message */}
        <h1 className="mb-4 text-3xl font-bold text-[#e15f6e]">
          Chat Coming Soon!
        </h1>
        <p className="mb-2 text-lg text-white/70">
          The chat interface will be implemented in Phase 4.
        </p>
        <p className="mb-6 text-sm text-white/50">
          Round ID: <span className="font-mono">{roundId}</span>
        </p>

        {/* Back Button */}
        <Button
          onClick={() => router.push('/main-menu')}
          size="lg"
          className="bg-gradient-to-r from-[#f53049] to-[#f22a5a] hover:from-[#f53049]/90 hover:to-[#f22a5a]/90"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Menu
        </Button>

        {/* Phase Info */}
        <div className="mt-8 rounded-lg border border-[#e15f6e]/20 bg-[#0a0d1a] p-4">
          <h2 className="mb-2 text-sm font-semibold text-[#e15f6e]">
            ✅ Phase 3: Girl Generation - Complete
          </h2>
          <p className="text-xs text-white/60">
            Girl selection is now functional. The chat simulation engine will be implemented next.
          </p>
        </div>
      </div>
    </main>
  );
}


