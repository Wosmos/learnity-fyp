import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-4xl font-bold tracking-tight text-foreground',
      h2: 'text-3xl font-semibold tracking-tight text-foreground',
      h3: 'text-2xl font-semibold text-foreground',
      h4: 'text-xl font-semibold text-foreground',
      body: 'text-base text-foreground',
      'body-sm': 'text-sm text-muted-foreground',
      caption: 'text-xs text-muted-foreground',
      overline:
        'text-xs font-bold uppercase tracking-widest text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

const defaultElements: Record<string, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  overline: 'span',
};

interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

function Typography({
  className,
  variant = 'body',
  as,
  children,
  ...props
}: TypographyProps) {
  const Component = as || defaultElements[variant || 'body'] || 'p';

  return (
    <Component
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export { Typography, typographyVariants };
