import { SignupForm } from '@/components/auth/SignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - CharmDojo',
  description: 'Create your CharmDojo account',
};

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#e15f6e]">Create your account</h2>
        <p className="text-sm text-gray-300">
          Start practicing your conversation skills today
        </p>
      </div>

      <SignupForm />
    </div>
  );
}

