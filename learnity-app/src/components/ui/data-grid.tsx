'use client';

import * as React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ─── Column Definition ───────────────────────────────────────

export interface ColumnDef<T> {
  /** Unique key — also used as data accessor unless `render` is provided */
  key: string;
  /** Header label */
  header: string;
  /** Header alignment */
  headerAlign?: 'left' | 'center' | 'right';
  /** Cell alignment */
  align?: 'left' | 'center' | 'right';
  /** Max width class for truncation (e.g. 'max-w-[200px]') */
  maxWidth?: string;
  /** Extra className applied to every cell in this column */
  className?: string;
  /** Enable click-to-sort on this column. Requires a sortValue or uses the raw key accessor. */
  sortable?: boolean;
  /** Extract the sortable value from the item (for nested/computed fields) */
  sortValue?: (item: T) => string | number;
  /** Custom cell renderer — gets the full row item */
  render?: (item: T, index: number) => React.ReactNode;
}

// ─── Component Props ─────────────────────────────────────────

export interface DataGridProps<T> {
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Data rows */
  data: T[];
  /** Unique key extractor — defaults to `(item as any).id` */
  rowKey?: (item: T, index: number) => string;
  /** Message shown when data is empty */
  emptyMessage?: string;
  /** Show a loading skeleton */
  loading?: boolean;
  /** Number of skeleton rows to show while loading */
  loadingRows?: number;
  /** Show a search input above the table */
  searchPlaceholder?: string;
  /** Filter function called with (item, query). Required if searchPlaceholder is set. */
  searchFilter?: (item: T, query: string) => boolean;
  /** Number of rows per page. Omit for no pagination. */
  pageSize?: number;
  /** Additional className for the wrapper */
  className?: string;
  /** Callback when a row is clicked */
  onRowClick?: (item: T, index: number) => void;
}

// ─── Helpers ─────────────────────────────────────────────────

const cellAlign = (align?: 'left' | 'center' | 'right', isFirst?: boolean, isLast?: boolean) =>
  cn(
    align === 'center' && 'text-center',
    align === 'right' && 'text-right',
    isFirst && 'pl-6',
    isLast && align === 'right' && 'pr-6',
  );

// ─── Component ───────────────────────────────────────────────

export function DataGrid<T>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No results found.',
  loading = false,
  loadingRows = 5,
  searchPlaceholder,
  searchFilter,
  pageSize,
  className,
  onRowClick,
}: DataGridProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
  const [page, setPage] = React.useState(0);

  const getKey = rowKey ?? ((item: T, index: number) => (item as Record<string, unknown>).id as string ?? String(index));

  // ── Search ──
  const searched = searchPlaceholder && searchFilter && searchQuery
    ? data.filter(item => searchFilter(item, searchQuery.toLowerCase()))
    : data;

  // ── Sort ──
  const sorted = React.useMemo(() => {
    if (!sortKey) return searched;
    const col = columns.find(c => c.key === sortKey);
    if (!col?.sortable) return searched;

    return [...searched].sort((a, b) => {
      const aVal = col.sortValue
        ? col.sortValue(a)
        : (a as Record<string, unknown>)[sortKey] as string | number ?? '';
      const bVal = col.sortValue
        ? col.sortValue(b)
        : (b as Record<string, unknown>)[sortKey] as string | number ?? '';
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searched, sortKey, sortDir, columns]);

  // ── Paginate ──
  const totalPages = pageSize ? Math.ceil(sorted.length / pageSize) : 1;
  const paginated = pageSize ? sorted.slice(page * pageSize, (page + 1) * pageSize) : sorted;

  // Reset page when data or search changes
  React.useEffect(() => { setPage(0); }, [searchQuery, data]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* ── Search bar ── */}
      {searchPlaceholder && (
        <div className='flex items-center px-4 py-3'>
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='max-w-sm'
          />
          <span className='ml-auto text-sm text-muted-foreground'>
            {searched.length} of {data.length} entries
          </span>
        </div>
      )}

      {/* ── Table ── */}
      <div className='overflow-auto'>
        <Table>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              {columns.map((col, i) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    cellAlign(col.headerAlign ?? col.align, i === 0, i === columns.length - 1),
                    col.maxWidth,
                  )}
                >
                  {col.sortable ? (
                    <Button
                      variant='ghost'
                      className='h-8 px-2 -ml-2'
                      onClick={() => handleSort(col.key)}
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ArrowUp className='ml-1 h-3 w-3' /> : <ArrowDown className='ml-1 h-3 w-3' />
                      ) : (
                        <ArrowUpDown className='ml-1 h-3 w-3 opacity-40' />
                      )}
                    </Button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col, ci) => (
                    <TableCell key={col.key} className={cellAlign(col.align, ci === 0, ci === columns.length - 1)}>
                      <div className='h-4 w-3/4 rounded bg-muted animate-pulse' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center text-muted-foreground'>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, rowIndex) => (
                <TableRow
                  key={getKey(item, rowIndex)}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={onRowClick ? () => onRowClick(item, rowIndex) : undefined}
                >
                  {columns.map((col, ci) => {
                    const isFirst = ci === 0;
                    const isLast = ci === columns.length - 1;

                    if (col.render) {
                      return (
                        <TableCell
                          key={col.key}
                          className={cn(cellAlign(col.align, isFirst, isLast), col.maxWidth, col.maxWidth && 'truncate', col.className)}
                        >
                          {col.render(item, rowIndex)}
                        </TableCell>
                      );
                    }

                    const value = (item as Record<string, unknown>)[col.key];
                    return (
                      <TableCell
                        key={col.key}
                        className={cn(cellAlign(col.align, isFirst, isLast), col.maxWidth, col.maxWidth && 'truncate', col.className)}
                      >
                        {value != null ? String(value) : '—'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      {pageSize && totalPages > 1 && (
        <div className='flex items-center justify-between px-4 py-3 border-t border-border'>
          <span className='text-sm text-muted-foreground'>
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              Previous
            </Button>
            <Button variant='outline' size='sm' onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
