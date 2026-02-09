'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CompactPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function CompactPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: CompactPaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPageButton(i));
      }
    } else {
      // Logic for truncated pagination
      pages.push(renderPageButton(1));

      if (currentPage > 3) {
        pages.push(
          <span
            key='dots-1'
            className='flex items-center justify-center w-10 text-slate-400'
          >
            <MoreHorizontal className='h-4 w-4' />
          </span>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i === 1 || i === totalPages) continue;
        pages.push(renderPageButton(i));
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <span
            key='dots-2'
            className='flex items-center justify-center w-10 text-slate-400'
          >
            <MoreHorizontal className='h-4 w-4' />
          </span>
        );
      }

      pages.push(renderPageButton(totalPages));
    }

    return pages;
  };

  const renderPageButton = (page: number) => (
    <button
      key={page}
      onClick={() => onPageChange(page)}
      className={cn(
        'w-10 h-10 rounded-xl text-xs font-black transition-all duration-300',
        currentPage === page
          ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-110 z-10'
          : 'text-slate-500 hover:bg-slate-100'
      )}
    >
      {page}
    </button>
  );

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant='outline'
        size='icon'
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className='h-10 w-10 rounded-xl border-slate-100 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 disabled:opacity-30'
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>

      <div className='flex items-center px-2'>{renderPageNumbers()}</div>

      <Button
        variant='outline'
        size='icon'
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className='h-10 w-10 rounded-xl border-slate-100 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 disabled:opacity-30'
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  );
}
