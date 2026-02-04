import { ReactNode, useEffect, useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface TimeConfig {
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
  accentColor: string;
}

const timeConfigs: Record<TimeOfDay, TimeConfig> = {
  morning: {
    gradientFrom: '#FFA726',
    gradientTo: '#FFE082',
    iconColor: '#FFA726',
    accentColor: '#FFD54F',
  },
  afternoon: {
    gradientFrom: '#FF8A65',
    gradientTo: '#FFCC80',
    iconColor: '#FF7043',
    accentColor: '#FFAB91',
  },
  evening: {
    gradientFrom: '#FF7043',
    gradientTo: '#9575CD',
    iconColor: '#FF5722',
    accentColor: '#CE93D8',
  },
  night: {
    gradientFrom: '#5C6BC0',
    gradientTo: '#7986CB',
    iconColor: '#C5CAE9',
    accentColor: '#9FA8DA',
  },
};

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function AnimatedTimeIcon({ timeOfDay, className }: { timeOfDay: TimeOfDay; className?: string }) {
  const config = timeConfigs[timeOfDay];

  if (timeOfDay === 'night') {
    return (
      <svg viewBox="0 0 48 48" className={cn("w-full h-full", className)}>
        {/* Stars */}
        <g className="animate-pulse">
          <circle cx="8" cy="10" r="1.5" fill={config.accentColor} opacity="0.8" />
          <circle cx="38" cy="6" r="1" fill={config.accentColor} opacity="0.6" />
          <circle cx="42" cy="20" r="1.5" fill={config.accentColor} opacity="0.5" />
          <circle cx="14" cy="5" r="0.8" fill={config.accentColor} opacity="0.9" />
        </g>
        {/* Moon */}
        <defs>
          <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.gradientFrom} />
            <stop offset="100%" stopColor={config.gradientTo} />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="14" fill="url(#moonGrad)" />
        <circle cx="30" cy="20" r="12" fill="hsl(var(--card))" />
      </svg>
    );
  }

  // Sun with animated rays
  const rayCount = 8;
  const rays = Array.from({ length: rayCount }, (_, i) => (i * 360) / rayCount);

  return (
    <svg viewBox="0 0 48 48" className={cn("w-full h-full overflow-visible", className)}>
      <defs>
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={config.gradientFrom} />
          <stop offset="100%" stopColor={config.gradientTo} />
        </linearGradient>
        <filter id="sunGlow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Rays */}
      <g style={{ animation: 'spin 20s linear infinite', transformOrigin: 'center' }}>
        {rays.map((angle, i) => (
          <line
            key={i}
            x1="24"
            y1="24"
            x2="24"
            y2="6"
            stroke={config.accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.5 + (i % 2) * 0.2}
            transform={`rotate(${angle} 24 24)`}
            style={{
              animation: `pulse ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </g>
      {/* Sun body */}
      <circle
        cx="24"
        cy="24"
        r="10"
        fill="url(#sunGrad)"
        filter="url(#sunGlow)"
        style={{ animation: 'pulse 2s ease-in-out infinite' }}
      />
      <circle cx="20" cy="20" r="3" fill="white" opacity="0.3" />
    </svg>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  variant?: 'warm' | 'card';
  rightContent?: ReactNode;
  /** Overrides the default time-of-day animated icon (used on the left). */
  icon?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  showBack = true,
  variant = 'warm',
  rightContent,
  icon,
  children,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const timeOfDay = useMemo(() => getTimeOfDay(currentTime.getHours()), [currentTime]);
  const config = timeConfigs[timeOfDay];

  const isWarm = variant === 'warm';
  const hasCustomIcon = !!icon;

  return (
    <header className={cn(
      "px-4 pt-5 pb-4 flex-shrink-0",
      isWarm ? "gradient-warm" : "bg-card border-b border-border"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              onClick={() => navigate('/')}
              className={cn(
                "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors",
                isWarm ? "bg-card" : "bg-muted"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div
            className={cn(
              "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-500",
              mounted && "animate-scale-in",
              hasCustomIcon && "bg-primary/10 hover-scale"
            )}
            style={
              hasCustomIcon
                ? undefined
                : {
                    background: `linear-gradient(135deg, ${config.gradientFrom}20, ${config.gradientTo}30)`,
                    boxShadow: `0 4px 16px ${config.iconColor}25`,
                  }
            }
          >
            {hasCustomIcon ? (
              <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
            ) : mounted ? (
              <AnimatedTimeIcon timeOfDay={timeOfDay} className="w-8 h-8" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-foreground/70 font-medium truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightContent}
          <ThemeToggle />
        </div>
      </div>
      {children}
    </header>
  );
}
