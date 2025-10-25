import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Update Password - CharmDojo',
  description: 'Set your new CharmDojo password',
};

export default function UpdatePasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Set new password</h2>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account
        </p>
      </div>

      <UpdatePasswordForm />
    </div>
  );
}

