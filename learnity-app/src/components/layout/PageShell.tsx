import { cn } from '@/lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  noPadding?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-4xl',
  md: 'max-w-6xl',
  lg: 'max-w-[1400px]',
  xl: 'max-w-[1600px]',
  full: 'max-w-full',
};

export function PageShell({
  children,
  className,
  maxWidth = 'xl',
  noPadding = false,
}: PageShellProps) {
  return (
    <div className='min-h-screen bg-background'>
      <div
        className={cn(
          maxWidthClasses[maxWidth],
          'mx-auto',
          !noPadding && 'px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10',
          'space-y-6',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
