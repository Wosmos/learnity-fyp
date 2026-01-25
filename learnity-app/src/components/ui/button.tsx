import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles - blended from both versions
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        // === ORIGINAL VARIANTS (Backward Compatible) ===
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',

        // === NEW PERSONALITY VARIANTS (From Version 2) ===
        onyx: [
          'bg-white text-black rounded-xl text-[11px] font-black uppercase tracking-[0.2em] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
          'hover:bg-slate-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]',
          'after:absolute after:inset-0 after:bg-gradient-to-tr after:from-black/10 after:to-transparent after:opacity-0 hover:after:opacity-100 transition-opacity',
        ],
        morphic: [
          'bg-[#050608] text-slate-400 border border-white/[0.05] rounded-xl text-[11px] font-black uppercase tracking-[0.2em] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
          'hover:text-white hover:border-white/40 hover:bg-[#0a0c10]',
          "before:absolute before:inset-0 before:bg-[url('https://grainy-gradients.vercel.app/noise.svg')] before:opacity-0 hover:before:opacity-[0.03]",
        ],
        nova: [
          'bg-[#050608] text-white border border-indigo-500/30 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
          'hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]',
          'after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-indigo-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-500',
        ],
        shadow: [
          'border-b-2 border-white/5 bg-transparent text-slate-500 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
          'hover:text-white hover:border-white/20 hover:bg-white/[0.02]',
        ],
        void: [
          'text-slate-500 tracking-[0.4em] font-bold rounded-xl text-[11px] font-black uppercase tracking-[0.2em] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
          "hover:text-white hover:bg-white/[0.03] before:content-['//'] before:mr-2 before:opacity-0 hover:before:opacity-40 before:transition-opacity",
        ],

        // === ENHANCED CTA VARIANTS ===
        cta: 'bg-slate-600 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-300',
        ctaSecondary:
          'bg-white text-blue-600 hover:bg-gray-50 border-2 border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300',
        gradient:
          'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300',

        // === NEW UNIQUE VARIANTS ===
        // Crystal: Glass morphism with subtle glow
        crystal: [
          'bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl',
          'hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.1)]',
        ],

        // Cyber: Neon cyberpunk style
        cyber: [
          'bg-black text-cyan-400 border-2 border-cyan-400/30 rounded-xl font-mono text-xs tracking-wider',
          'hover:bg-cyan-400/10 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]',
          'after:absolute after:inset-0 after:bg-gradient-to-r after:from-cyan-400/10 after:to-purple-400/10 after:opacity-0 hover:after:opacity-100',
        ],

        // Organic: Natural, soft colors
        organic: [
          'bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl',
          'shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.3)]',
          'transition-all duration-300 ease-out',
        ],

        // Minimal: Ultra clean with subtle interaction
        minimal: [
          'bg-transparent text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100',
          'border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600',
          'px-0 py-2 h-auto font-medium text-sm',
        ],

        // Holographic: Iridescent effect
        holographic: [
          'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white rounded-xl',
          'bg-size-200 bg-pos-0 hover:bg-pos-100 bg-clip-text text-transparent',
          'hover:animate-gradient-x transition-all duration-700',
          'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
        ],
      },
      size: {
        // Original sizes (backward compatible)
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',

        // New sizes from personality variants
        'personality-default':
          'h-12 px-8 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]',
        'personality-sm': 'h-9 px-4 text-[9px] tracking-[0.3em] rounded-xl',
        'personality-lg': 'h-16 px-10 text-[13px] rounded-2xl',
        'personality-icon': 'size-12 rounded-xl',
      },
    },
    compoundVariants: [
      // Auto-apply personality sizes when using personality variants
      {
        variant: [
          'onyx',
          'morphic',
          'nova',
          'shadow',
          'void',
          'crystal',
          'cyber',
          'organic',
          'minimal',
          'holographic',
        ],
        class:
          'h-12 px-8 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  // Handle loading state for all variants
  const isLoading = loading || props.disabled;

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin' />
          <span className='opacity-50 italic'>Loading...</span>
        </div>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
