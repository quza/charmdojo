'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  className?: string;
}

export function StatsCard({ label, value, suffix, className }: StatsCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border-0',
        'bg-gradient-to-br from-[#04060c] to-[#0a0d1a]',
        'before:absolute before:inset-0 before:rounded-xl before:p-[1px]',
        'before:bg-gradient-to-r before:from-[#f53049]/30 before:to-[#f22a5a]/30',
        'before:content-[""] before:-z-10',
        'after:absolute after:inset-[1px] after:rounded-xl',
        'after:bg-gradient-to-br after:from-[#04060c] after:to-[#0a0d1a]',
        'after:content-[""] after:-z-10',
        className
      )}
    >
      <CardHeader className="relative z-10 pb-2">
        <CardTitle className="text-sm font-medium text-white/70">{label}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-[#e15f6e]">{value}</span>
          {suffix && (
            <Badge variant="outline" className="mb-1.5 border-[#e15f6e]/30 text-[#e15f6e]">
              {suffix}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

