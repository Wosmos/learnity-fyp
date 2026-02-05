'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AnimatedBackgroundProps {
  className?: string;
  showGrid?: boolean;
}

export const AnimatedBackground = ({
  className,
  showGrid = true,
}: AnimatedBackgroundProps) => {
  return (
    <div
      className={cn(
        'absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#020617]',
        className
      )}
    >
      {/* Animated Blob 1 */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className='absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]'
      />

      {/* Animated Blob 2 */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className='absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[100px]'
      />

      {/* Subtle Moving Grid */}
      {showGrid && (
        <>
          <motion.div
            initial={{ backgroundPosition: '0 0' }}
            animate={{ backgroundPosition: '40px 40px' }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"
          />
          <div className='absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]' />
        </>
      )}
    </div>
  );
};

export default AnimatedBackground;
