'use client';

import { useState } from 'react';
import { useVTS } from '@/contexts/VTSContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AlertsPanelProps {
  compact?: boolean;
  maxItems?: number;
}

export default function AlertsPanel({ compact = false, maxItems }: AlertsPanelProps) {
  const { alerts, acknowledgeAlert, resolveAlert } = useVTS();
  const [filter, setFilter] = useState<'all' | 'critical' | 'unread'>('all');

  const filteredAlerts = alerts
    .filter(alert => {
      if (filter === 'critical') return alert.severity === 'critical';
      if (filter === 'unread') return !alert.isRead;
      return true;
    })
    .slice(0, maxItems || alerts.length);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">🚨 Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">⚠️ High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">📢 Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800">ℹ️ Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">❓ Unknown</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'speeding': return '🚨';
      case 'geofence_entry': return '📍';
      case 'geofence_exit': return '🚪';
      case 'fuel_theft': return '⛽';
      case 'panic_button': return '🆘';
      case 'unauthorized_movement': return '🔒';
      default: return '⚠️';
    }
  };

  if (compact) {
    return (
      <ScrollArea className="h-full">
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-lg">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getSeverityBadge(alert.severity)}
                    {!alert.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-gray-600 truncate">
                    {alert.message}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(alert.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-gray-500">No alerts to display</p>
            </div>
          )}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alert Management</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All ({alerts.length})
              </Button>
              <Button
                size="sm"
                variant={filter === 'critical' ? 'default' : 'outline'}
                onClick={() => setFilter('critical')}
              >
                Critical ({alerts.filter(a => a.severity === 'critical').length})
              </Button>
              <Button
                size="sm"
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilter('unread')}
              >
                Unread ({alerts.filter(a => !a.isRead).length})
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="space-y-1">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                      !alert.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-2xl mt-1">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getSeverityBadge(alert.severity)}
                            {!alert.isRead && (
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                New
                              </Badge>
                            )}
                            {alert.isResolved && (
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                ✓ Resolved
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {alert.title}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>📅 {new Date(alert.createdAt).toLocaleString()}</span>
                            {alert.vehicle && (
                              <span>🚗 {alert.vehicle.licensePlate}</span>
                            )}
                            <span>📍 {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
                            {alert.speed && (
                              <span>⚡ {alert.speed} km/h</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!alert.isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        {!alert.isResolved && (
                          <Button
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔔</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
                  <p className="text-gray-500">
                    {filter === 'all' 
                      ? "Your fleet is operating smoothly with no active alerts."
                      : `No ${filter} alerts at this time.`
                    }
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}