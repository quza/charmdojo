import { type ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface FeatureCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'stat';
}

export default function FeatureCard({
  children,
  className = '',
  variant = 'default',
}: FeatureCardProps) {
  const baseStyles =
    'rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl';

  const variantStyles = {
    default: 'bg-neutral-800/50 border border-neutral-700 p-8 lg:p-10',
    gradient:
      'bg-gradient-to-br from-secondary to-accent p-8 lg:p-12 border-none',
    stat: 'bg-neutral-800/50 border border-neutral-700 p-8 lg:p-10',
  };

  return (
    <Card className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </Card>
  );
}

