'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function GeofenceManager() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Geofence Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geofence Manager</h3>
            <p className="text-gray-500 mb-4">
              Create and manage virtual boundaries for your vehicles.
            </p>
            <Button>Create Geofence</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}