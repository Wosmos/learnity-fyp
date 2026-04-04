'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant='ghost' size='icon-sm' className={className} disabled>
        <Sun size={16} />
      </Button>
    );
  }

  if (compact) {
    return (
      <Button
        variant='ghost'
        size='icon-sm'
        className={className}
        onClick={() =>
          setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')
        }
      >
        {theme === 'dark' ? (
          <Moon size={16} />
        ) : theme === 'light' ? (
          <Sun size={16} />
        ) : (
          <Monitor size={16} />
        )}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-lg bg-muted p-1',
        className
      )}
    >
      {[
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
      ].map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
            theme === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title={label}
        >
          <Icon size={14} />
          <span className='hidden sm:inline'>{label}</span>
        </button>
      ))}
    </div>
  );
}
