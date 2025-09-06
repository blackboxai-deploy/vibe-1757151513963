'use client';

import { useEffect, useRef, useState } from 'react';
import { LiveVehicleData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VehicleMapProps {
  vehicles: LiveVehicleData[];
  compact?: boolean;
  selectedVehicleId?: string;
  onVehicleSelect?: (vehicleId: string) => void;
}

export default function VehicleMap({ 
  vehicles, 
  compact = false, 
  selectedVehicleId,
  onVehicleSelect 
}: VehicleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapView, setMapView] = useState<'satellite' | 'street' | 'hybrid'>('street');
  const [showTraffic, setShowTraffic] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance) return;

    // Check if Leaflet is available
    if (typeof window !== 'undefined' && (window as any).L) {
      const L = (window as any).L;
      
      // Create map instance
      const map = L.map(mapRef.current).setView([24.7136, 46.6753], 10); // Riyadh coordinates as default

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      setMapInstance(map);
      setIsLoaded(true);
    } else {
      // Fallback: Load Leaflet dynamically
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        if (mapRef.current) {
          const L = (window as any).L;
          const map = L.map(mapRef.current).setView([24.7136, 46.6753], 10);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          setMapInstance(map);
          setIsLoaded(true);
        }
      };
      document.head.appendChild(script);
    }
  }, [mapInstance]);

  // Update vehicle markers
  useEffect(() => {
    if (!mapInstance || !isLoaded) return;

    const L = (window as any).L;
    
    // Clear existing markers
    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        mapInstance.removeLayer(layer);
      }
    });

    // Add vehicle markers
    vehicles.forEach((vehicleData) => {
      const { vehicle, tracking, driverStatus } = vehicleData;
      
      // Determine marker color based on status
      const getMarkerColor = () => {
        if (driverStatus === 'offline') return '#6B7280'; // Gray
        if (driverStatus === 'idle') return '#F59E0B'; // Orange
        if (tracking.speed > vehicle.maxSpeed) return '#EF4444'; // Red
        return '#10B981'; // Green
      };

      // Create custom icon
      const markerIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            width: 30px; 
            height: 30px; 
            border-radius: 50%; 
            background: ${getMarkerColor()};
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
            font-weight: bold;
          ">
            🚗
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Create marker
      const marker = L.marker([tracking.latitude, tracking.longitude], {
        icon: markerIcon
      }).addTo(mapInstance);

      // Add popup with vehicle info
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${vehicle.licensePlate}</h3>
          <p style="margin: 0; color: #6B7280; font-size: 12px;">${vehicle.make} ${vehicle.model}</p>
          <hr style="margin: 8px 0; border: none; border-top: 1px solid #E5E7EB;">
          <div style="font-size: 12px;">
            <div style="margin: 4px 0;">
              <strong>Speed:</strong> ${tracking.speed} km/h
            </div>
            <div style="margin: 4px 0;">
              <strong>Fuel:</strong> ${tracking.fuelLevel}%
            </div>
            <div style="margin: 4px 0;">
              <strong>Status:</strong> 
              <span style="
                background: ${getMarkerColor()};
                color: white;
                padding: 2px 6px;
                border-radius: 12px;
                font-size: 10px;
              ">
                ${driverStatus.toUpperCase()}
              </span>
            </div>
            <div style="margin: 4px 0;">
              <strong>Last Update:</strong> ${new Date(tracking.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle click event
      marker.on('click', () => {
        if (onVehicleSelect) {
          onVehicleSelect(vehicle.id);
        }
      });

      // Highlight selected vehicle
      if (selectedVehicleId === vehicle.id) {
        marker.openPopup();
      }
    });

    // Fit map to show all vehicles
    if (vehicles.length > 0) {
      const group = new L.featureGroup(
        vehicles.map(v => L.marker([v.tracking.latitude, v.tracking.longitude]))
      );
      mapInstance.fitBounds(group.getBounds().pad(0.1));
    }

  }, [mapInstance, vehicles, selectedVehicleId, onVehicleSelect, isLoaded]);

  const MapControls = () => (
    <div className="absolute top-4 right-4 z-[1000] space-y-2">
      <div className="bg-white rounded-lg shadow-lg p-2 space-y-1">
        <Button
          size="sm"
          variant={mapView === 'street' ? 'default' : 'outline'}
          className="w-full text-xs"
          onClick={() => setMapView('street')}
        >
          Street
        </Button>
        <Button
          size="sm"
          variant={mapView === 'satellite' ? 'default' : 'outline'}
          className="w-full text-xs"
          onClick={() => setMapView('satellite')}
        >
          Satellite
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-2">
        <Button
          size="sm"
          variant={showTraffic ? 'default' : 'outline'}
          className="w-full text-xs"
          onClick={() => setShowTraffic(!showTraffic)}
        >
          {showTraffic ? '🚦' : '🗺️'} Traffic
        </Button>
      </div>
    </div>
  );

  const VehicleStats = () => (
    <div className="absolute bottom-4 left-4 z-[1000]">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">
              {vehicles.filter(v => v.driverStatus === 'driving').length} Driving
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-600">
              {vehicles.filter(v => v.driverStatus === 'idle').length} Idle
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-gray-600">
              {vehicles.filter(v => v.driverStatus === 'offline').length} Offline
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
        <div ref={mapRef} className="w-full h-full" />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        <VehicleStats />
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>🗺️</span>
            <span>Live Vehicle Tracking</span>
            <Badge>{vehicles.length} Vehicles</Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={isLoaded ? 'text-green-600 border-green-200' : 'text-gray-600'}
            >
              {isLoaded ? '🟢 Map Loaded' : '🔄 Loading...'}
            </Badge>
            <Button size="sm" variant="outline">
              📍 Center Map
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-96">
          <div ref={mapRef} className="w-full h-full" />
          
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-800">Loading Interactive Map</p>
                <p className="text-sm text-gray-600">Preparing vehicle tracking visualization...</p>
              </div>
            </div>
          )}

          <MapControls />
          <VehicleStats />
        </div>
      </CardContent>
    </Card>
  );
}