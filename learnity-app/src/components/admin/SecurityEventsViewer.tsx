'use client';

/**
 * Security Events Viewer Component
 * Provides admin interface for monitoring and analyzing security events
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  SecurityEventWithUser, 
  SecurityEventFilters, 
  PaginatedSecurityEvents 
} from '@/lib/services/audit.service';
import { SecurityEventType, RiskLevel } from '@/types/auth';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Shield, Eye, Ban } from 'lucide-react';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';

interface SecurityEventsViewerProps {
  className?: string;
}

interface FilterState extends SecurityEventFilters {
  searchTerm?: string;
  dateRange?: 'today' | 'week' | 'month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
}

export const SecurityEventsViewer: React.FC<SecurityEventsViewerProps> = ({ className }) => {
  const [events, setEvents] = useState<PaginatedSecurityEvents>({
    events: [],
    total: 0,
    page: 1,
    pageSize: 50,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    limit: 50,
    offset: 0,
    dateRange: 'today'
  });
  const [selectedEvent, setSelectedEvent] = useState<SecurityEventWithUser | null>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    criticalEvents: 0,
    blockedEvents: 0,
    uniqueIps: 0
  });
  const api = useAuthenticatedApi();

  /**
   * Fetch security events with current filters
   */
  const fetchSecurityEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryFilters: SecurityEventFilters = {
        ...filters,
        startDate: getStartDate(filters.dateRange, filters.customStartDate),
        endDate: getEndDate(filters.dateRange, filters.customEndDate)
      };

      const data: PaginatedSecurityEvents = await api.post('/api/admin/security-events', queryFilters);
      setEvents(data);

      // Calculate stats
      const uniqueIps = new Set(data.events.map(e => e.ipAddress)).size;
      const criticalEvents = data.events.filter(e => e.riskLevel === RiskLevel.CRITICAL).length;
      const blockedEvents = data.events.filter(e => e.blocked).length;

      setStats({
        totalEvents: data.total,
        criticalEvents,
        blockedEvents,
        uniqueIps
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, api]);

  useEffect(() => {
    fetchSecurityEvents();
  }, [fetchSecurityEvents]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: key !== 'limit' ? 0 : prev.offset
    }));
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      offset: (newPage - 1) * (prev.limit || 50)
    }));
  };

  /**
   * Block IP address
   */
  const handleBlockIp = async (ipAddress: string) => {
    try {
      const response = await fetch('/api/admin/security/block-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ipAddress })
      });

      if (!response.ok) {
        throw new Error('Failed to block IP address');
      }

      // Refresh events
      fetchSecurityEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block IP');
    }
  };

  /**
   * Get risk level color
   */
  const getRiskLevelColor = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case RiskLevel.LOW: return 'bg-green-100 text-green-800';
      case RiskLevel.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case RiskLevel.HIGH: return 'bg-orange-100 text-orange-800';
      case RiskLevel.CRITICAL: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get event type icon
   */
  const getEventTypeIcon = (eventType: SecurityEventType) => {
    switch (eventType) {
      case SecurityEventType.SUSPICIOUS_LOGIN: return <Eye className="h-4 w-4" />;
      case SecurityEventType.BOT_DETECTED: return <Shield className="h-4 w-4" />;
      case SecurityEventType.RATE_LIMIT_EXCEEDED: return <Ban className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Events</h2>
          <p className="text-muted-foreground">
            Monitor and analyze security threats and suspicious activities
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.criticalEvents}</p>
                <p className="text-xs text-muted-foreground">Critical Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Ban className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.blockedEvents}</p>
                <p className="text-xs text-muted-foreground">Blocked Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.uniqueIps}</p>
                <p className="text-xs text-muted-foreground">Unique IPs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter security events by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="IP address or user..."
                value={filters.searchTerm || ''}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              />
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select
                value={filters.eventType || 'all'}
                onValueChange={(value) => handleFilterChange('eventType', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value={SecurityEventType.SUSPICIOUS_LOGIN}>Suspicious Login</SelectItem>
                  <SelectItem value={SecurityEventType.RATE_LIMIT_EXCEEDED}>Rate Limit Exceeded</SelectItem>
                  <SelectItem value={SecurityEventType.BOT_DETECTED}>Bot Detected</SelectItem>
                  <SelectItem value={SecurityEventType.MULTIPLE_FAILED_ATTEMPTS}>Multiple Failed Attempts</SelectItem>
                  <SelectItem value={SecurityEventType.NEW_DEVICE_LOGIN}>New Device Login</SelectItem>
                  <SelectItem value={SecurityEventType.UNUSUAL_ACTIVITY}>Unusual Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Risk Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Risk Level</label>
              <Select
                value={filters.riskLevel || 'all'}
                onValueChange={(value) => handleFilterChange('riskLevel', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value={RiskLevel.LOW}>Low</SelectItem>
                  <SelectItem value={RiskLevel.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={RiskLevel.HIGH}>High</SelectItem>
                  <SelectItem value={RiskLevel.CRITICAL}>Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blocked Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.blocked === undefined ? 'all' : filters.blocked.toString()}
                onValueChange={(value) => handleFilterChange('blocked', value === 'all' ? undefined : value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="true">Blocked</SelectItem>
                  <SelectItem value="false">Allowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select
                value={filters.dateRange || 'today'}
                onValueChange={(value) => handleFilterChange('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={filters.customStartDate || ''}
                    onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={filters.customEndDate || ''}
                    onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              {events.total} security events found
            </div>
            <Button onClick={fetchSecurityEvents} disabled={loading}>
              {loading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
          <CardDescription>
            Showing {events.events.length} of {events.total} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Timestamp</th>
                  <th className="text-left p-2 font-medium">Event Type</th>
                  <th className="text-left p-2 font-medium">Risk Level</th>
                  <th className="text-left p-2 font-medium">IP Address</th>
                  <th className="text-left p-2 font-medium">User</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.events.map((event) => (
                  <tr key={event.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        {getEventTypeIcon(event.eventType)}
                        <span className="text-sm">{event.eventType}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={getRiskLevelColor(event.riskLevel)}>
                        {event.riskLevel}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {event.ipAddress}
                      </code>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        {event.user ? (
                          <>
                            <div>{event.user.email}</div>
                            <div className="text-xs text-muted-foreground">
                              {event.user.firstName} {event.user.lastName}
                            </div>
                          </>
                        ) : (
                          'Anonymous'
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant={event.blocked ? 'destructive' : 'secondary'}>
                        {event.blocked ? 'Blocked' : 'Allowed'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEvent(event)}
                        >
                          View Details
                        </Button>
                        {!event.blocked && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlockIp(event.ipAddress)}
                          >
                            Block IP
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {events.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Page {events.page} of {events.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={events.page <= 1}
                  onClick={() => handlePageChange(events.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={events.page >= events.totalPages}
                  onClick={() => handlePageChange(events.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

/**
 * Event Details Modal Component
 */
interface EventDetailsModalProps {
  event: SecurityEventWithUser;
  onClose: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Security Event Details</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Event ID</label>
              <p className="text-sm text-muted-foreground">{event.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Timestamp</label>
              <p className="text-sm text-muted-foreground">
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Event Type</label>
              <p className="text-sm text-muted-foreground">{event.eventType}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Risk Level</label>
              <Badge className={getRiskLevelColor(event.riskLevel)}>
                {event.riskLevel}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Badge variant={event.blocked ? 'destructive' : 'secondary'}>
                {event.blocked ? 'Blocked' : 'Allowed'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">IP Address</label>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {event.ipAddress}
              </code>
            </div>
          </div>

          {event.firebaseUid && (
            <div>
              <label className="text-sm font-medium">Firebase UID</label>
              <p className="text-sm text-muted-foreground font-mono">{event.firebaseUid}</p>
            </div>
          )}

          {event.user && (
            <div>
              <label className="text-sm font-medium">User Information</label>
              <div className="text-sm text-muted-foreground">
                <p>{event.user.firstName} {event.user.lastName}</p>
                <p>{event.user.email}</p>
                <p>Role: {event.user.role}</p>
              </div>
            </div>
          )}

          {event.reason && (
            <div>
              <label className="text-sm font-medium">Reason</label>
              <p className="text-sm text-muted-foreground">{event.reason}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">User Agent</label>
            <p className="text-xs text-muted-foreground break-all">{event.userAgent}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Device Fingerprint</label>
            <p className="text-xs text-muted-foreground font-mono">{event.deviceFingerprint}</p>
          </div>

          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div>
              <label className="text-sm font-medium">Metadata</label>
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions (same as AuditLogViewer)
function getStartDate(dateRange?: string, customStartDate?: string): Date | undefined {
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

function getEndDate(dateRange?: string, customEndDate?: string): Date | undefined {
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

function getRiskLevelColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case RiskLevel.LOW: return 'bg-green-100 text-green-800';
    case RiskLevel.MEDIUM: return 'bg-yellow-100 text-yellow-800';
    case RiskLevel.HIGH: return 'bg-orange-100 text-orange-800';
    case RiskLevel.CRITICAL: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}