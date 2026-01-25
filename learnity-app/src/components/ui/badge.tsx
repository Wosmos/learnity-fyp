import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        /* ------------------- BACKWARD COMPATIBLE VARIANTS ------------------- */
        /* These match standard shadcn/ui usage so your old code works fine */
        default:
          'border-transparent bg-primary text-primary-foreground hover:text-white hover:bg-primary/80 duration-200 ease-in-out',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',

        /* ------------------- NEW AESTHETIC VARIANTS ------------------- */
        /* Use these for the 3D Landing Page */
        glass:
          'border-0 bg-white/5 text-white ring-1 ring-white/10 backdrop-blur-md hover:bg-white/10 hover:ring-white/20 shadow-sm',
        neon: 'border-transparent bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:bg-emerald-500/20',
        gradient:
          'border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 shadow-md',
      },

      /* ------------------- SIZE VARIANTS ------------------- */
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-[2px] text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode; // Optional: Added support for icons
}

function Badge({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className='mr-1.5 flex items-center'>{icon}</span>}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
