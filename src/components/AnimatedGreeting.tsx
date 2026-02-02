import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface TimeConfig {
  greeting: string;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
  accentColor: string;
}

const timeConfigs: Record<TimeOfDay, TimeConfig> = {
  morning: {
    greeting: 'Good Morning',
    gradientFrom: '#FFA726',
    gradientTo: '#FFE082',
    iconColor: '#FFA726',
    accentColor: '#FFD54F',
  },
  afternoon: {
    greeting: 'Good Afternoon',
    gradientFrom: '#FF8A65',
    gradientTo: '#FFCC80',
    iconColor: '#FF7043',
    accentColor: '#FFAB91',
  },
  evening: {
    greeting: 'Good Evening',
    gradientFrom: '#FF7043',
    gradientTo: '#9575CD',
    iconColor: '#FF5722',
    accentColor: '#CE93D8',
  },
  night: {
    greeting: 'Good Night',
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

// Animated sun/moon SVG component
function TimeIcon({ timeOfDay, className }: { timeOfDay: TimeOfDay; className?: string }) {
  const config = timeConfigs[timeOfDay];
  
  if (timeOfDay === 'night') {
    // Moon with stars
    return (
      <div className={cn("relative", className)}>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Stars */}
          <g className="animate-pulse">
            <circle cx="12" cy="12" r="1.5" fill={config.accentColor} opacity="0.8" />
            <circle cx="52" cy="8" r="1" fill={config.accentColor} opacity="0.6" />
            <circle cx="8" cy="32" r="1" fill={config.accentColor} opacity="0.7" />
            <circle cx="56" cy="28" r="1.5" fill={config.accentColor} opacity="0.5" />
            <circle cx="20" cy="6" r="0.8" fill={config.accentColor} opacity="0.9" />
          </g>
          {/* Moon */}
          <g className="origin-center animate-[pulse_3s_ease-in-out_infinite]">
            <defs>
              <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={config.gradientFrom} />
                <stop offset="100%" stopColor={config.gradientTo} />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="18" fill="url(#moonGradient)" />
            <circle cx="38" cy="28" r="16" fill="hsl(var(--card))" />
          </g>
        </svg>
      </div>
    );
  }

  // Sun with rays (morning/afternoon/evening)
  const rayCount = 8;
  const rays = Array.from({ length: rayCount }, (_, i) => {
    const angle = (i * 360) / rayCount;
    return angle;
  });

  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 64 64" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.gradientFrom} />
            <stop offset="100%" stopColor={config.gradientTo} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Animated rays */}
        <g 
          className="origin-center"
          style={{ 
            animation: 'spin 20s linear infinite',
          }}
        >
          {rays.map((angle, i) => (
            <line
              key={i}
              x1="32"
              y1="32"
              x2="32"
              y2="6"
              stroke={config.accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity={0.6 + (i % 2) * 0.2}
              transform={`rotate(${angle} 32 32)`}
              style={{
                animation: `pulse ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </g>
        
        {/* Sun body with glow */}
        <circle
          cx="32"
          cy="32"
          r="14"
          fill="url(#sunGradient)"
          filter="url(#glow)"
          className="origin-center"
          style={{
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        
        {/* Inner highlight */}
        <circle
          cx="28"
          cy="28"
          r="4"
          fill="white"
          opacity="0.3"
        />
      </svg>
      
      {/* Floating particles for morning/afternoon */}
      {(timeOfDay === 'morning' || timeOfDay === 'afternoon') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{
                left: `${20 + i * 25}%`,
                top: `${30 + i * 15}%`,
                animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Horizon line for evening */}
      {timeOfDay === 'evening' && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-full"
          style={{
            background: `linear-gradient(to top, ${config.accentColor}40, transparent)`,
          }}
        />
      )}
    </div>
  );
}

export function AnimatedGreeting() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const timeOfDay = useMemo(() => {
    return getTimeOfDay(currentTime.getHours());
  }, [currentTime]);

  const config = timeConfigs[timeOfDay];

  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-full bg-primary/20 animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div 
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden",
          "transition-all duration-500 ease-out",
          mounted && "animate-scale-in"
        )}
        style={{
          background: `linear-gradient(135deg, ${config.gradientFrom}20, ${config.gradientTo}30)`,
          boxShadow: `0 4px 20px ${config.iconColor}30`,
        }}
      >
        <TimeIcon timeOfDay={timeOfDay} className="w-10 h-10" />
      </div>
      <div className={cn("transition-opacity duration-300", mounted ? "opacity-100" : "opacity-0")}>
        <p className="text-foreground/80 font-semibold animate-fade-in">
          {config.greeting}
        </p>
      </div>
    </div>
  );
}
