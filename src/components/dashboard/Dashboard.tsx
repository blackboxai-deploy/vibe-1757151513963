'use client';

import { useState } from 'react';
import { useAuth, useRole } from '@/contexts/AuthContext';
import { useVTS } from '@/contexts/VTSContext';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import DashboardStats from './DashboardStats';
import VehicleMap from './VehicleMap';
import VehicleList from './VehicleList';
import AlertsPanel from './AlertsPanel';
import GeofenceManager from './GeofenceManager';
import ReportsPanel from './ReportsPanel';
import AISupport from './AISupport';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type DashboardTab = 
  | 'overview' 
  | 'tracking' 
  | 'vehicles' 
  | 'alerts' 
  | 'geofences' 
  | 'reports' 
  | 'support' 
  | 'admin';

export default function Dashboard() {
  const { user, organization } = useAuth();
  const { canManageVehicles, canViewAllVehicles, isSuperAdmin, isOrgAdmin } = useRole();
  const { 
    vehicles, 
    alerts, 
    isConnected, 
    isLoading, 
    error,
    liveVehicleData,
    clearError 
  } = useVTS();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Calculate dashboard statistics
  const liveVehicles = Array.from(liveVehicleData.values());
  const dashboardStats = {
    totalVehicles: vehicles.length,
    activeVehicles: liveVehicles.filter(v => v.driverStatus !== 'offline').length,
    totalAlerts: alerts.filter(a => !a.isResolved).length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical' && !a.isResolved).length,
    avgSpeed: Math.round(
      liveVehicles.reduce((acc, v) => acc + v.tracking.speed, 0) / 
      Math.max(liveVehicles.length, 1)
    ),
    totalDistance: liveVehicles.reduce((acc, v) => acc + (v.vehicle.currentKm || 0), 0),
    fuelConsumption: liveVehicles.reduce(
      (acc, v) => acc + (100 - v.tracking.fuelLevel), 0
    ),
    topSpeed: Math.max(...liveVehicles.map(v => v.tracking.speed), 0),
  };

  // Available tabs based on user role
  const availableTabs = [
    { id: 'overview', label: 'Overview', icon: '📊', available: true },
    { id: 'tracking', label: 'Live Tracking', icon: '🗺️', available: canViewAllVehicles() },
    { id: 'vehicles', label: 'Vehicles', icon: '🚗', available: canViewAllVehicles() },
    { id: 'alerts', label: 'Alerts', icon: '🚨', available: canViewAllVehicles() },
    { id: 'geofences', label: 'Geofences', icon: '🏢', available: canManageVehicles() },
    { id: 'reports', label: 'Reports', icon: '📈', available: canViewAllVehicles() },
    { id: 'support', label: 'AI Support', icon: '🤖', available: true },
    { id: 'admin', label: 'Admin', icon: '⚙️', available: isOrgAdmin() },
  ] as const;

  const filteredTabs = availableTabs.filter(tab => tab.available);

  // Connection status indicator
  const connectionStatus = (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
      isConnected 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      }`} />
      <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        connectionStatus={connectionStatus}
      />

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          tabs={filteredTabs}
          activeTab={activeTab}
          onTabChange={(tab: string) => setActiveTab(tab as DashboardTab)}
          alertCount={dashboardStats.criticalAlerts}
        />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}>
          <div className="p-6 space-y-6">
            {/* Error Alert */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-red-600">⚠️</div>
                    <div>
                      <p className="font-medium text-red-800">System Error</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearError}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Dismiss
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {filteredTabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-gray-600">
                    Welcome back, {user?.firstName} {user?.lastName}
                  </p>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {user?.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {organization && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {organization.region.replace('_', ' ').toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {connectionStatus}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  disabled={isLoading}
                >
                  {isLoading ? '🔄' : '↻'} Refresh
                </Button>
              </div>
            </div>

            {/* Tab Content */}
            <Tabs value={activeTab} className="space-y-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <DashboardStats stats={dashboardStats} />
                
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Quick Map View */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span>🗺️</span>
                        <span>Live Vehicle Positions</span>
                        <Badge>{dashboardStats.activeVehicles} Active</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 rounded-lg overflow-hidden">
                        <VehicleMap 
                          vehicles={Array.from(liveVehicleData.values())} 
                          compact={true}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Alerts */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span>🚨</span>
                        <span>Recent Alerts</span>
                        <Badge variant={dashboardStats.criticalAlerts > 0 ? 'destructive' : 'secondary'}>
                          {dashboardStats.totalAlerts}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AlertsPanel compact={true} maxItems={5} />
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button
                        variant="outline"
                        className="h-20 flex-col space-y-2"
                        onClick={() => setActiveTab('tracking')}
                      >
                        <span className="text-2xl">🗺️</span>
                        <span className="text-sm">Live Tracking</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col space-y-2"
                        onClick={() => setActiveTab('alerts')}
                      >
                        <span className="text-2xl">🚨</span>
                        <span className="text-sm">View Alerts</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col space-y-2"
                        onClick={() => setActiveTab('reports')}
                      >
                        <span className="text-2xl">📈</span>
                        <span className="text-sm">Generate Report</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col space-y-2"
                        onClick={() => setActiveTab('support')}
                      >
                        <span className="text-2xl">🤖</span>
                        <span className="text-sm">AI Support</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Live Tracking Tab */}
              <TabsContent value="tracking" className="space-y-6">
                <VehicleMap vehicles={Array.from(liveVehicleData.values())} />
              </TabsContent>

              {/* Vehicles Tab */}
              <TabsContent value="vehicles" className="space-y-6">
                <VehicleList />
              </TabsContent>

              {/* Alerts Tab */}
              <TabsContent value="alerts" className="space-y-6">
                <AlertsPanel />
              </TabsContent>

              {/* Geofences Tab */}
              <TabsContent value="geofences" className="space-y-6">
                <GeofenceManager />
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <ReportsPanel />
              </TabsContent>

              {/* AI Support Tab */}
              <TabsContent value="support" className="space-y-6">
                <AISupport />
              </TabsContent>

              {/* Admin Tab */}
              <TabsContent value="admin" className="space-y-6">
                {isSuperAdmin() && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Super Admin Controls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <Button variant="outline">Manage Organizations</Button>
                        <Button variant="outline">System Configuration</Button>
                        <Button variant="outline">Global Reports</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <Button variant="outline">Manage Users</Button>
                      <Button variant="outline">Vehicle Settings</Button>
                      <Button variant="outline">Alert Configuration</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}