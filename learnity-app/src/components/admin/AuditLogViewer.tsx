'use client';

/**
 * Comprehensive Audit Log Viewer Component
 * Provides admin interface for viewing and analyzing authentication audit logs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AuditLog, AuditFilters } from '@/lib/interfaces/auth';
import { PaginatedAuditLogs } from '@/lib/services/audit.service';
import { EventType } from '@/types/auth';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface AuditLogViewerProps {
  className?: string;
}

interface FilterState extends AuditFilters {
  searchTerm?: string;
  dateRange?: 'today' | 'week' | 'month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  className,
}) => {
  const [logs, setLogs] = useState<PaginatedAuditLogs>({
    logs: [],
    total: 0,
    page: 1,
    pageSize: 50,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    limit: 50,
    offset: 0,
    dateRange: 'today',
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const api = useAuthenticatedApi();

  /**
   * Fetch audit logs with current filters
   */
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryFilters: AuditFilters = {
        ...filters,
        startDate: getStartDate(filters.dateRange, filters.customStartDate),
        endDate: getEndDate(filters.dateRange, filters.customEndDate),
      };

      const data: PaginatedAuditLogs = await api.post(
        '/api/admin/audit-logs',
        queryFilters
      );
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, api]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof FilterState, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: key !== 'limit' ? 0 : prev.offset, // Reset pagination when filters change
    }));
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      offset: (newPage - 1) * (prev.limit || 50),
    }));
  };

  /**
   * Export audit logs
   */
  const handleExport = async () => {
    try {
      const queryFilters: AuditFilters = {
        ...filters,
        limit: 10000, // Export more records
        startDate: getStartDate(filters.dateRange, filters.customStartDate),
        endDate: getEndDate(filters.dateRange, filters.customEndDate),
      };

      const response = await api.fetch('/api/admin/audit-logs/export', {
        method: 'POST',
        body: JSON.stringify(queryFilters),
      });

      if (!response.ok) {
        throw new Error('Failed to export audit logs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Audit Logs</h2>
          <p className='text-muted-foreground'>
            View and analyze authentication and system events
          </p>
        </div>
        <Button onClick={handleExport} variant='outline'>
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter audit logs by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Search */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Search</label>
              <Input
                placeholder='Email, IP, or action...'
                value={filters.searchTerm || ''}
                onChange={e => handleFilterChange('searchTerm', e.target.value)}
              />
            </div>

            {/* Event Type */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Event Type</label>
              <Select
                value={filters.eventType || 'all'}
                onValueChange={value =>
                  handleFilterChange(
                    'eventType',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='All events' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Events</SelectItem>
                  <SelectItem value={EventType.AUTH_LOGIN}>Login</SelectItem>
                  <SelectItem value={EventType.AUTH_LOGOUT}>Logout</SelectItem>
                  <SelectItem value={EventType.AUTH_REGISTER}>
                    Registration
                  </SelectItem>
                  <SelectItem value={EventType.AUTH_PASSWORD_RESET}>
                    Password Reset
                  </SelectItem>
                  <SelectItem value={EventType.AUTH_EMAIL_VERIFY}>
                    Email Verification
                  </SelectItem>
                  <SelectItem value={EventType.ADMIN_ACTION}>
                    Admin Action
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Success Status */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Status</label>
              <Select
                value={
                  filters.success === undefined
                    ? 'all'
                    : filters.success.toString()
                }
                onValueChange={value =>
                  handleFilterChange(
                    'success',
                    value === 'all' ? undefined : value === 'true'
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='All statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='true'>Success</SelectItem>
                  <SelectItem value='false'>Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Date Range</label>
              <Select
                value={filters.dateRange || 'today'}
                onValueChange={value => handleFilterChange('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select range' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='today'>Today</SelectItem>
                  <SelectItem value='week'>Last 7 Days</SelectItem>
                  <SelectItem value='month'>Last 30 Days</SelectItem>
                  <SelectItem value='custom'>Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Start Date</label>
                  <Input
                    type='date'
                    value={filters.customStartDate || ''}
                    onChange={e =>
                      handleFilterChange('customStartDate', e.target.value)
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>End Date</label>
                  <Input
                    type='date'
                    value={filters.customEndDate || ''}
                    onChange={e =>
                      handleFilterChange('customEndDate', e.target.value)
                    }
                  />
                </div>
              </>
            )}
          </div>

          <div className='flex justify-between items-center mt-4'>
            <div className='text-sm text-muted-foreground'>
              {logs.total} total events found
            </div>
            <Button onClick={fetchAuditLogs} disabled={loading}>
              {loading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className='border-destructive'>
          <CardContent className='pt-6'>
            <p className='text-destructive'>{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Events</CardTitle>
          <CardDescription>
            Showing {logs.logs.length} of {logs.total} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left p-2 font-medium'>Timestamp</th>
                  <th className='text-left p-2 font-medium'>Event</th>
                  <th className='text-left p-2 font-medium'>User</th>
                  <th className='text-left p-2 font-medium'>IP Address</th>
                  <th className='text-left p-2 font-medium'>Status</th>
                  <th className='text-left p-2 font-medium'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.logs.map(log => (
                  <tr key={log.id} className='border-b hover:bg-muted/50'>
                    <td className='p-2'>
                      <div className='text-sm'>
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className='p-2'>
                      <div className='font-medium'>{log.eventType}</div>
                      <div className='text-sm text-muted-foreground'>
                        {log.action}
                      </div>
                    </td>
                    <td className='p-2'>
                      <div className='text-sm'>
                        {log.metadata?.email || log.firebaseUid || 'System'}
                      </div>
                    </td>
                    <td className='p-2'>
                      <code className='text-xs bg-muted px-1 py-0.5 rounded'>
                        {log.ipAddress}
                      </code>
                    </td>
                    <td className='p-2'>
                      <Badge variant={log.success ? 'default' : 'destructive'}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </td>
                    <td className='p-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setSelectedLog(log)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logs.totalPages > 1 && (
            <div className='flex justify-between items-center mt-4'>
              <div className='text-sm text-muted-foreground'>
                Page {logs.page} of {logs.totalPages}
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={logs.page <= 1}
                  onClick={() => handlePageChange(logs.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={logs.page >= logs.totalPages}
                  onClick={() => handlePageChange(logs.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <LogDetailsModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

/**
 * Log Details Modal Component
 */
interface LogDetailsModalProps {
  log: AuditLog;
  onClose: () => void;
}

const LogDetailsModal: React.FC<LogDetailsModalProps> = ({ log, onClose }) => {
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <Card className='w-full max-w-2xl max-h-[80vh] overflow-y-auto'>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>Audit Log Details</CardTitle>
            <Button variant='ghost' size='sm' onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium'>Event ID</label>
              <p className='text-sm text-muted-foreground'>{log.id}</p>
            </div>
            <div>
              <label className='text-sm font-medium'>Timestamp</label>
              <p className='text-sm text-muted-foreground'>
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium'>Event Type</label>
              <p className='text-sm text-muted-foreground'>{log.eventType}</p>
            </div>
            <div>
              <label className='text-sm font-medium'>Action</label>
              <p className='text-sm text-muted-foreground'>{log.action}</p>
            </div>
            <div>
              <label className='text-sm font-medium'>Status</label>
              <Badge variant={log.success ? 'default' : 'destructive'}>
                {log.success ? 'Success' : 'Failed'}
              </Badge>
            </div>
            <div>
              <label className='text-sm font-medium'>IP Address</label>
              <code className='text-xs bg-muted px-1 py-0.5 rounded'>
                {log.ipAddress}
              </code>
            </div>
          </div>

          {log.firebaseUid && (
            <div>
              <label className='text-sm font-medium'>Firebase UID</label>
              <p className='text-sm text-muted-foreground font-mono'>
                {log.firebaseUid}
              </p>
            </div>
          )}

          {log.resource && (
            <div>
              <label className='text-sm font-medium'>Resource</label>
              <p className='text-sm text-muted-foreground'>{log.resource}</p>
            </div>
          )}

          {log.errorMessage && (
            <div>
              <label className='text-sm font-medium'>Error Message</label>
              <p className='text-sm text-destructive'>{log.errorMessage}</p>
            </div>
          )}

          <div>
            <label className='text-sm font-medium'>User Agent</label>
            <p className='text-xs text-muted-foreground break-all'>
              {log.userAgent}
            </p>
          </div>

          {log.deviceFingerprint && (
            <div>
              <label className='text-sm font-medium'>Device Fingerprint</label>
              <p className='text-xs text-muted-foreground font-mono'>
                {log.deviceFingerprint}
              </p>
            </div>
          )}

          {log.oldValues && Object.keys(log.oldValues).length > 0 && (
            <div>
              <label className='text-sm font-medium'>Old Values</label>
              <pre className='text-xs bg-muted p-2 rounded overflow-x-auto'>
                {JSON.stringify(log.oldValues, null, 2)}
              </pre>
            </div>
          )}

          {log.newValues && Object.keys(log.newValues).length > 0 && (
            <div>
              <label className='text-sm font-medium'>New Values</label>
              <pre className='text-xs bg-muted p-2 rounded overflow-x-auto'>
                {JSON.stringify(log.newValues, null, 2)}
              </pre>
            </div>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <label className='text-sm font-medium'>Metadata</label>
              <pre className='text-xs bg-muted p-2 rounded overflow-x-auto'>
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
function getStartDate(
  dateRange?: string,
  customStartDate?: string
): Date | undefined {
  const now = new Date();

  switch (dateRange) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'custom':
      return customStartDate ? new Date(customStartDate) : undefined;
    default:
      return undefined;
  }
}

function getEndDate(
  dateRange?: string,
  customEndDate?: string
): Date | undefined {
  const now = new Date();

  switch (dateRange) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    case 'week':
    case 'month':
      return now;
    case 'custom':
      return customEndDate ? new Date(customEndDate) : undefined;
    default:
      return undefined;
  }
}
