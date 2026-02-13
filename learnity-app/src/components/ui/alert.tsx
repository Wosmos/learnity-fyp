import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-[2rem] border p-5 backdrop-blur-xl transition-all duration-500 [&>svg~*]:pl-9 [&>svg+div]:translate-y-[-1px] [&>svg]:absolute [&>svg]:left-5 [&>svg]:top-5 [&>svg]:size-5',
  {
    variants: {
      variant: {
        // Deep obsidian glass for general info
        default: 'bg-white/[0.03] text-slate-300 border-white/10 shadow-2xl',

        // High-contrast warning/error
        destructive:
          'bg-red-500/[0.05] border-red-500/20 text-red-400 [&>svg]:text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.05)]',

        // Success variant for registration completion
        success:
          'bg-emerald-500/[0.05] border-emerald-500/20 text-emerald-400 [&>svg]:text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.05)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role='alert'
    className={cn(
      alertVariants({ variant }),
      'animate-in fade-in slide-in-from-top-2 duration-500',
      className
    )}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      'mb-1.5 font-black uppercase italic tracking-widest text-sm leading-none',
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'text-xs font-medium text-slate-500 leading-relaxed',
      className
    )}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
