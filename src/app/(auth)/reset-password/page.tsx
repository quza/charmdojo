import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password - CharmDojo',
  description: 'Reset your CharmDojo password',
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Reset your password</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ll send you a link to reset your password
        </p>
      </div>

      <PasswordResetForm />
    </div>
  );
}

