'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  updatePasswordSchema,
  type UpdatePasswordFormData,
} from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculatePasswordStrength,
  getPasswordStrengthProgress,
} from '@/lib/utils/password-strength';
import { toast } from 'sonner';

export function UpdatePasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string;
    color: string;
  }>({
    score: 0,
    level: 'weak',
    feedback: '',
    color: '#ef4444',
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const password = watch('password');

  // Update password strength when password changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    if (pwd) {
      const strength = calculatePasswordStrength(pwd);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({
        score: 0,
        level: 'weak',
        feedback: '',
        color: '#ef4444',
      });
    }
  };

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message || 'Failed to update password');
        return;
      }

      toast.success('Password updated successfully!');
      router.push('/login');
    } catch (error) {
      console.error('Update password error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Instructions */}
      <p className="text-sm text-muted-foreground">
        Enter your new password below.
      </p>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isLoading}
          {...register('password', {
            onChange: handlePasswordChange,
          })}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}

        {/* Password strength indicator */}
        {password && (
          <div className="space-y-1">
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${getPasswordStrengthProgress(passwordStrength.score)}%`,
                  backgroundColor: passwordStrength.color,
                }}
              />
            </div>
            <p className="text-xs" style={{ color: passwordStrength.color }}>
              {passwordStrength.feedback}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isLoading}
          {...register('confirmPassword')}
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Updating password...
          </>
        ) : (
          'Update password'
        )}
      </Button>
    </form>
  );
}

