import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'default' | 'primary' | 'success';
}

export function StatCard({ icon: Icon, label, value, subtext, variant = 'default' }: StatCardProps) {
  const variants = {
    default: 'bg-card',
    primary: 'gradient-primary text-primary-foreground',
    success: 'gradient-success text-success-foreground',
  };

  return (
    <div className={cn('stat-card', variants[variant])}>
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center mb-2',
        variant === 'default' ? 'bg-primary/10' : 'bg-white/20'
      )}>
        <Icon className={cn(
          'w-6 h-6',
          variant === 'default' ? 'text-primary' : 'text-current'
        )} />
      </div>
      <span className="text-2xl font-bold">{value}</span>
      <span className={cn(
        'text-sm font-medium',
        variant === 'default' ? 'text-muted-foreground' : 'text-current/80'
      )}>
        {label}
      </span>
      {subtext && (
        <span className={cn(
          'text-xs',
          variant === 'default' ? 'text-muted-foreground' : 'text-current/60'
        )}>
          {subtext}
        </span>
      )}
    </div>
  );
}
