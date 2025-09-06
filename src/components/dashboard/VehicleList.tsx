'use client';

import { useState } from 'react';
import { useVTS } from '@/contexts/VTSContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function VehicleList() {
  const { vehicles, liveVehicleData, immobilizeVehicle, controlFuel, triggerSOS } = useVTS();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('licensePlate');

  // Filter and sort vehicles
  const filteredVehicles = vehicles
    .filter(vehicle => {
      const matchesSearch = vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (statusFilter === 'all') return true;
      
      const liveData = liveVehicleData.get(vehicle.id);
      return liveData?.driverStatus === statusFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'licensePlate':
          return a.licensePlate.localeCompare(b.licensePlate);
        case 'make':
          return a.make.localeCompare(b.make);
        case 'status':
          const statusA = liveVehicleData.get(a.id)?.driverStatus || 'offline';
          const statusB = liveVehicleData.get(b.id)?.driverStatus || 'offline';
          return statusA.localeCompare(statusB);
        case 'fuel':
          const fuelA = liveVehicleData.get(a.id)?.tracking.fuelLevel || 0;
          const fuelB = liveVehicleData.get(b.id)?.tracking.fuelLevel || 0;
          return fuelB - fuelA;
        default:
          return 0;
      }
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'driving':
        return <Badge className="bg-green-100 text-green-800">🚗 Driving</Badge>;
      case 'idle':
        return <Badge className="bg-orange-100 text-orange-800">⏸️ Idle</Badge>;
      case 'offline':
        return <Badge className="bg-gray-100 text-gray-800">📵 Offline</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">❓ Unknown</Badge>;
    }
  };

  const getFuelBadge = (level: number) => {
    if (level > 50) return <Badge className="bg-green-100 text-green-800">{level}%</Badge>;
    if (level > 20) return <Badge className="bg-orange-100 text-orange-800">{level}%</Badge>;
    return <Badge className="bg-red-100 text-red-800">{level}%</Badge>;
  };

  const handleVehicleAction = async (vehicleId: string, action: string) => {
    try {
      switch (action) {
        case 'immobilize':
          await immobilizeVehicle(vehicleId, true);
          break;
        case 'enable':
          await immobilizeVehicle(vehicleId, false);
          break;
        case 'fuel_cut':
          await controlFuel(vehicleId, false);
          break;
        case 'fuel_enable':
          await controlFuel(vehicleId, true);
          break;
        case 'sos':
          await triggerSOS(vehicleId);
          break;
      }
    } catch (error) {
      console.error('Vehicle action failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Fleet Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="driving">Driving</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="licensePlate">License Plate</SelectItem>
                  <SelectItem value="make">Make</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="fuel">Fuel Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button className="w-full">
                + Add Vehicle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Fuel</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => {
                const liveData = liveVehicleData.get(vehicle.id);
                const tracking = liveData?.tracking;
                const status = liveData?.driverStatus || 'offline';

                return (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{vehicle.licensePlate}</div>
                        <div className="text-sm text-gray-500">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(status)}
                    </TableCell>
                    <TableCell>
                      {tracking ? (
                        <div className="text-sm">
                          <div>{tracking.latitude.toFixed(4)}, {tracking.longitude.toFixed(4)}</div>
                          <div className="text-gray-500">
                            {new Date(tracking.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No data</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tracking ? (
                        <div className="text-sm">
                          <div>{tracking.speed} km/h</div>
                          <div className="text-gray-500">Max: {vehicle.maxSpeed} km/h</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tracking ? (
                        getFuelBadge(tracking.fuelLevel)
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">-</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {vehicle.driver ? (
                        <div className="text-sm">
                          <div>{vehicle.driver.firstName} {vehicle.driver.lastName}</div>
                          <div className="text-gray-500">{vehicle.driver.phoneNumber}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleVehicleAction(vehicle.id, 'sos')}>
                            🆘 Trigger SOS
                          </DropdownMenuItem>
                          {vehicle.hasImmobilizer && (
                            <>
                              <DropdownMenuItem onClick={() => handleVehicleAction(vehicle.id, 'immobilize')}>
                                🔒 Immobilize Vehicle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleVehicleAction(vehicle.id, 'enable')}>
                                🔓 Enable Vehicle
                              </DropdownMenuItem>
                            </>
                          )}
                          {vehicle.hasFuelControl && (
                            <>
                              <DropdownMenuItem onClick={() => handleVehicleAction(vehicle.id, 'fuel_cut')}>
                                ⛽ Cut Fuel
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleVehicleAction(vehicle.id, 'fuel_enable')}>
                                ⛽ Enable Fuel
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            📍 View on Map
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            📊 View Reports
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredVehicles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-500">
                {vehicles.length === 0 
                  ? "Add your first vehicle to get started with tracking."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}