'use client';

/**
 * Custom Animated Background Component
 * Creates a native-looking gradient mesh background for the app
 * Optimized for performance with CSS animations
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface AnimatedBackgroundProps {
  variant?: 'default' | 'subtle' | 'vibrant' | 'dark';
  className?: string;
  animated?: boolean;
}

export function AnimatedBackground({ 
  variant = 'default', 
  className,
  animated = true 
}: AnimatedBackgroundProps) {
  
  const variants = {
    default: {
      bg: 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40',
      orbs: [
        'from-blue-400/20 to-indigo-400/20',
        'from-purple-400/15 to-pink-400/15',
        'from-cyan-400/10 to-blue-400/10',
      ]
    },
    subtle: {
      bg: 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100',
      orbs: [
        'from-slate-300/10 to-gray-300/10',
        'from-blue-300/8 to-slate-300/8',
      ]
    },
    vibrant: {
      bg: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
      orbs: [
        'from-blue-500/25 to-purple-500/25',
        'from-purple-500/20 to-pink-500/20',
        'from-indigo-500/15 to-blue-500/15',
        'from-pink-500/12 to-rose-500/12',
      ]
    },
    dark: {
      bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
      orbs: [
        'from-blue-600/20 to-indigo-600/20',
        'from-purple-600/15 to-blue-600/15',
        'from-indigo-600/10 to-purple-600/10',
      ]
    }
  };

  const config = variants[variant];

  return (
    <div className={cn(
      "fixed inset-0 -z-10 overflow-hidden",
      config.bg,
      className
    )}>
      {/* Animated Gradient Orbs */}
      {animated && config.orbs.map((gradient, index) => (
        <div
          key={index}
          className={cn(
            "absolute rounded-full blur-3xl opacity-50",
            `bg-gradient-to-br ${gradient}`,
            // Different sizes and positions for each orb
            index === 0 && "w-[600px] h-[600px] -top-48 -right-48 animate-float-slow",
            index === 1 && "w-[500px] h-[500px] top-1/3 -left-32 animate-float-slower",
            index === 2 && "w-[400px] h-[400px] bottom-0 right-1/4 animate-float-medium",
            index === 3 && "w-[450px] h-[450px] bottom-1/4 left-1/3 animate-float-fast",
          )}
          style={{
            animationDelay: `${index * 2}s`,
          }}
        />
      ))}

      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Radial Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/10" />
    </div>
  );
}

// Add these animations to your global CSS (globals.css)
export const backgroundAnimationStyles = `
@keyframes float-slow {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
}

@keyframes float-slower {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  50% {
    transform: translate(-40px, 40px) scale(1.1) rotate(5deg);
  }
}

@keyframes float-medium {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(25px, -35px) scale(1.08);
  }
}

@keyframes float-fast {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  33% {
    transform: translate(-25px, -25px) scale(1.05) rotate(-3deg);
  }
  66% {
    transform: translate(25px, 25px) scale(0.98) rotate(3deg);
  }
}

.animate-float-slow {
  animation: float-slow 20s ease-in-out infinite;
}

.animate-float-slower {
  animation: float-slower 25s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 18s ease-in-out infinite;
}

.animate-float-fast {
  animation: float-fast 15s ease-in-out infinite;
}

.bg-gradient-radial {
  background: radial-gradient(circle at center, var(--tw-gradient-stops));
}
`;

export default AnimatedBackground;
