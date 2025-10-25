'use client';

import { SigninForm } from '@/components/auth/SigninForm';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { toast } from 'sonner';

function LoginContent() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'oauth_failed') {
      toast.error('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#e15f6e]">Welcome back</h2>
        <p className="text-sm text-gray-300">
          Sign in to continue your training
        </p>
      </div>

      <SigninForm />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#e15f6e]">Welcome back</h2>
          <p className="text-sm text-gray-300">
            Sign in to continue your training
          </p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

