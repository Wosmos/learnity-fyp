'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ChevronRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Item {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  impact: string;
  category: string;
}

export function ProfileActionGrid({ items }: { items: Item[] }) {
  const router = useRouter();

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.02, backgroundColor: '#F8FAFC' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/dashboard/teacher/profile/${item.id}`)}
          className={`
            cursor-pointer group relative p-5 rounded-xl border transition-all duration-300
            ${
              item.completed
                ? 'bg-slate-50 border-slate-100 opacity-60'
                : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
            }
          `}
        >
          <div className='flex justify-between items-start'>
            <div className='flex gap-4'>
              <div
                className={`
                mt-1 h-5 w-5 rounded-full flex items-center justify-center
                ${item.completed ? 'text-emerald-500' : 'text-slate-300'}
              `}
              >
                {item.completed ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Circle size={20} />
                )}
              </div>

              <div>
                <h4
                  className={`font-semibold ${item.completed ? 'text-slate-500' : 'text-slate-900'}`}
                >
                  {item.title}
                </h4>
                <p className='text-xs text-slate-500 mt-1'>
                  {item.description}
                </p>

                {!item.completed && (
                  <div className='mt-3 flex items-center gap-2'>
                    <span
                      className={`
                       text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded
                       ${item.impact === 'High' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}
                     `}
                    >
                      {item.impact} Impact
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!item.completed && (
              <div className='h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors'>
                <ChevronRight size={14} />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
