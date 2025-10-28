'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

export function ActionCard({ title, description, icon: Icon, onClick, className }: ActionCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer overflow-hidden border-0 transition-all duration-300',
        'hover:scale-105 hover:shadow-lg hover:shadow-[#f53049]/20',
        'bg-gradient-to-br from-[#04060c] to-[#0a0d1a]',
        'before:absolute before:inset-0 before:rounded-xl before:p-[1px]',
        'before:bg-gradient-to-r before:from-[#f53049] before:to-[#f22a5a]',
        'before:content-[""] before:-z-10',
        'after:absolute after:inset-[1px] after:rounded-xl',
        'after:bg-gradient-to-br after:from-[#04060c] after:to-[#0a0d1a]',
        'after:content-[""] after:-z-10',
        className
      )}
    >
      <CardHeader className="relative z-10">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gradient-to-r from-[#f53049] to-[#f22a5a] p-4">
            <Icon className="size-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-center text-2xl text-[#e15f6e]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <CardDescription className="text-center text-white/80">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

