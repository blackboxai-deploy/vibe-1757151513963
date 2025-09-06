'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { Vehicle, VehicleTracking, Alert, Geofence, LiveVehicleData, WebSocketMessage } from '@/types';
import { useAuth } from './AuthContext';

interface VTSState {
  vehicles: Vehicle[];
  liveTracking: Map<string, VehicleTracking>;
  alerts: Alert[];
  geofences: Geofence[];
  liveVehicleData: Map<string, LiveVehicleData>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  selectedVehicleId: string | null;
  trackingInterval: number;
}

interface VTSAction {
  type: 
    | 'SET_LOADING'
    | 'SET_ERROR'
    | 'CLEAR_ERROR'
    | 'SET_VEHICLES'
    | 'UPDATE_VEHICLE'
    | 'SET_TRACKING_DATA'
    | 'UPDATE_TRACKING'
    | 'SET_ALERTS'
    | 'ADD_ALERT'
    | 'UPDATE_ALERT'
    | 'SET_GEOFENCES'
    | 'UPDATE_GEOFENCE'
    | 'SET_LIVE_DATA'
    | 'UPDATE_LIVE_DATA'
    | 'SET_CONNECTION_STATUS'
    | 'SELECT_VEHICLE'
    | 'SET_TRACKING_INTERVAL';
  payload?: any;
}

interface VTSContextType extends VTSState {
  // Vehicle Management
  loadVehicles: () => Promise<void>;
  updateVehicle: (vehicleId: string, data: Partial<Vehicle>) => Promise<void>;
  immobilizeVehicle: (vehicleId: string, immobilize: boolean) => Promise<void>;
  controlFuel: (vehicleId: string, enable: boolean) => Promise<void>;
  
  // Tracking
  startTracking: (vehicleId?: string) => void;
  stopTracking: (vehicleId?: string) => void;
  getVehicleHistory: (vehicleId: string, startDate: Date, endDate: Date) => Promise<VehicleTracking[]>;
  
  // Alerts
  loadAlerts: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  
  // Geofences
  loadGeofences: () => Promise<void>;
  createGeofence: (geofence: Omit<Geofence, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGeofence: (geofenceId: string, data: Partial<Geofence>) => Promise<void>;
  deleteGeofence: (geofenceId: string) => Promise<void>;
  
  // Emergency
  triggerSOS: (vehicleId: string, description?: string) => Promise<void>;
  
  // Utility
  selectVehicle: (vehicleId: string | null) => void;
  clearError: () => void;
  setTrackingInterval: (interval: number) => void;
}

const VTSContext = createContext<VTSContextType | undefined>(undefined);

const initialState: VTSState = {
  vehicles: [],
  liveTracking: new Map(),
  alerts: [],
  geofences: [],
  liveVehicleData: new Map(),
  isConnected: false,
  isLoading: false,
  error: null,
  selectedVehicleId: null,
  trackingInterval: 30, // 30 seconds default
};

function vtsReducer(state: VTSState, action: VTSAction): VTSState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_VEHICLES':
      return { ...state, vehicles: action.payload, isLoading: false };
    
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map(v => 
          v.id === action.payload.id ? { ...v, ...action.payload } : v
        ),
      };
    
    case 'SET_TRACKING_DATA':
      return {
        ...state,
        liveTracking: new Map(action.payload.map((t: VehicleTracking) => [t.vehicleId, t])),
      };
    
    case 'UPDATE_TRACKING':
      const newTracking = new Map(state.liveTracking);
      newTracking.set(action.payload.vehicleId, action.payload);
      return { ...state, liveTracking: newTracking };
    
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    
    case 'UPDATE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(a => 
          a.id === action.payload.id ? { ...a, ...action.payload } : a
        ),
      };
    
    case 'SET_GEOFENCES':
      return { ...state, geofences: action.payload };
    
    case 'UPDATE_GEOFENCE':
      return {
        ...state,
        geofences: state.geofences.map(g => 
          g.id === action.payload.id ? { ...g, ...action.payload } : g
        ),
      };
    
    case 'SET_LIVE_DATA':
      return {
        ...state,
        liveVehicleData: new Map(action.payload.map((d: LiveVehicleData) => [d.vehicle.id, d])),
      };
    
    case 'UPDATE_LIVE_DATA':
      const newLiveData = new Map(state.liveVehicleData);
      newLiveData.set(action.payload.vehicle.id, action.payload);
      return { ...state, liveVehicleData: newLiveData };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    
    case 'SELECT_VEHICLE':
      return { ...state, selectedVehicleId: action.payload };
    
    case 'SET_TRACKING_INTERVAL':
      return { ...state, trackingInterval: action.payload };
    
    default:
      return state;
  }
}

export function VTSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(vtsReducer, initialState);
  const { user, token, isAuthenticated } = useAuth();
  const wsRef = React.useRef<WebSocket | null>(null);

  // Initialize VTS data when authenticated
  useEffect(() => {
    if (isAuthenticated && user && token) {
      loadInitialData();
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user, token]);

  // Setup tracking interval
  useEffect(() => {
    if (state.isConnected) {
      const interval = setInterval(() => {
        requestTrackingUpdate();
      }, state.trackingInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [state.isConnected, state.trackingInterval]);

  const loadInitialData = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await Promise.all([
        loadVehicles(),
        loadAlerts(),
        loadGeofences(),
      ]);
    } catch (error) {
      console.error('Failed to load initial VTS data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load VTS data' });
    }
  };

  const connectWebSocket = () => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws?token=${token}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('VTS WebSocket connected');
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('VTS WebSocket disconnected');
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
        
        // Reconnect after 5 seconds
        setTimeout(() => {
          if (isAuthenticated && token) {
            connectWebSocket();
          }
        }, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error('VTS WebSocket error:', error);
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'tracking_update':
        dispatch({ type: 'UPDATE_TRACKING', payload: message.payload });
        updateLiveVehicleData(message.payload);
        break;
      
      case 'alert_new':
        dispatch({ type: 'ADD_ALERT', payload: message.payload });
        break;
      
      case 'alert_update':
        dispatch({ type: 'UPDATE_ALERT', payload: message.payload });
        break;
      
      case 'vehicle_status':
        dispatch({ type: 'UPDATE_VEHICLE', payload: message.payload });
        break;
      
      case 'sos_incident':
        // Handle SOS incident - create critical alert
        const sosAlert = {
          id: `sos_${Date.now()}`,
          type: 'panic_button',
          severity: 'critical',
          title: 'SOS Alert',
          message: `Emergency signal from vehicle ${message.payload.vehicleId}`,
          vehicleId: message.payload.vehicleId,
          latitude: message.payload.latitude,
          longitude: message.payload.longitude,
          isRead: false,
          isResolved: false,
          createdAt: new Date(),
        };
        dispatch({ type: 'ADD_ALERT', payload: sosAlert });
        break;
    }
  };

  const updateLiveVehicleData = (trackingData: VehicleTracking) => {
    const vehicle = state.vehicles.find(v => v.id === trackingData.vehicleId);
    if (vehicle) {
      const liveData: LiveVehicleData = {
        vehicle,
        tracking: trackingData,
        alerts: state.alerts.filter(a => a.vehicleId === trackingData.vehicleId && !a.isResolved),
        isInGeofence: checkGeofenceStatus(trackingData, state.geofences),
        currentGeofences: getCurrentGeofences(trackingData, state.geofences),
        driverStatus: determineDriverStatus(trackingData),
        lastUpdate: new Date(),
      };
      
      dispatch({ type: 'UPDATE_LIVE_DATA', payload: liveData });
    }
  };

  const checkGeofenceStatus = (tracking: VehicleTracking, geofences: Geofence[]): boolean => {
    return geofences.some(geofence => {
      if (!geofence.isActive) return false;
      
      if (geofence.type === 'circular') {
        const distance = calculateDistance(
          tracking.latitude,
          tracking.longitude,
          geofence.coordinates[0].latitude,
          geofence.coordinates[0].longitude
        );
        return distance <= (geofence.radius || 0);
      }
      
      // For polygon geofences, implement point-in-polygon algorithm
      return isPointInPolygon(tracking, geofence.coordinates);
    });
  };

  const getCurrentGeofences = (tracking: VehicleTracking, geofences: Geofence[]): Geofence[] => {
    return geofences.filter(geofence => {
      if (!geofence.isActive) return false;
      
      if (geofence.type === 'circular') {
        const distance = calculateDistance(
          tracking.latitude,
          tracking.longitude,
          geofence.coordinates[0].latitude,
          geofence.coordinates[0].longitude
        );
        return distance <= (geofence.radius || 0);
      }
      
      return isPointInPolygon(tracking, geofence.coordinates);
    });
  };

  const determineDriverStatus = (tracking: VehicleTracking): 'driving' | 'idle' | 'offline' => {
    const lastUpdate = new Date(tracking.timestamp);
    const now = new Date();
    const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / 60000;

    if (minutesSinceUpdate > 15) return 'offline';
    if (tracking.speed < 5) return 'idle';
    return 'driving';
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const isPointInPolygon = (point: { latitude: number; longitude: number }, coordinates: { latitude: number; longitude: number }[]): boolean => {
    let inside = false;
    const x = point.longitude;
    const y = point.latitude;

    for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
      const xi = coordinates[i].longitude;
      const yi = coordinates[i].latitude;
      const xj = coordinates[j].longitude;
      const yj = coordinates[j].latitude;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  };

  const requestTrackingUpdate = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'request_tracking_update',
        organizationId: user?.organizationId,
        timestamp: new Date().toISOString(),
      }));
    }
  };

  // API Functions
  const loadVehicles = async (): Promise<void> => {
    try {
      const response = await fetch('/api/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'SET_VEHICLES', payload: data.data });
      } else {
        throw new Error(data.message || 'Failed to load vehicles');
      }
    } catch (error) {
      console.error('Load vehicles error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load vehicles' });
    }
  };

  const updateVehicle = async (vehicleId: string, data: Partial<Vehicle>): Promise<void> => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'UPDATE_VEHICLE', payload: result.data });
      } else {
        throw new Error(result.message || 'Failed to update vehicle');
      }
    } catch (error) {
      console.error('Update vehicle error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update vehicle' });
    }
  };

  const immobilizeVehicle = async (vehicleId: string, immobilize: boolean): Promise<void> => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/immobilize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ immobilize }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to control vehicle immobilizer');
      }
    } catch (error) {
      console.error('Immobilize vehicle error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to control vehicle immobilizer' });
    }
  };

  const controlFuel = async (vehicleId: string, enable: boolean): Promise<void> => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/fuel-control`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enable }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to control fuel system');
      }
    } catch (error) {
      console.error('Fuel control error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to control fuel system' });
    }
  };

  const startTracking = (vehicleId?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'start_tracking',
        vehicleId: vehicleId || 'all',
        organizationId: user?.organizationId,
      }));
    }
  };

  const stopTracking = (vehicleId?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_tracking',
        vehicleId: vehicleId || 'all',
        organizationId: user?.organizationId,
      }));
    }
  };

  const getVehicleHistory = async (vehicleId: string, startDate: Date, endDate: Date): Promise<VehicleTracking[]> => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/history?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to load vehicle history');
      }
    } catch (error) {
      console.error('Load vehicle history error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load vehicle history' });
      return [];
    }
  };

  const loadAlerts = async (): Promise<void> => {
    try {
      const response = await fetch('/api/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'SET_ALERTS', payload: data.data });
      } else {
        throw new Error(data.message || 'Failed to load alerts');
      }
    } catch (error) {
      console.error('Load alerts error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load alerts' });
    }
  };

  const acknowledgeAlert = async (alertId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'UPDATE_ALERT', payload: result.data });
      } else {
        throw new Error(result.message || 'Failed to acknowledge alert');
      }
    } catch (error) {
      console.error('Acknowledge alert error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to acknowledge alert' });
    }
  };

  const resolveAlert = async (alertId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'UPDATE_ALERT', payload: result.data });
      } else {
        throw new Error(result.message || 'Failed to resolve alert');
      }
    } catch (error) {
      console.error('Resolve alert error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to resolve alert' });
    }
  };

  const loadGeofences = async (): Promise<void> => {
    try {
      const response = await fetch('/api/geofences', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'SET_GEOFENCES', payload: data.data });
      } else {
        throw new Error(data.message || 'Failed to load geofences');
      }
    } catch (error) {
      console.error('Load geofences error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load geofences' });
    }
  };

  const createGeofence = async (geofence: Omit<Geofence, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      const response = await fetch('/api/geofences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geofence),
      });

      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'SET_GEOFENCES', payload: [...state.geofences, result.data] });
      } else {
        throw new Error(result.message || 'Failed to create geofence');
      }
    } catch (error) {
      console.error('Create geofence error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create geofence' });
    }
  };

  const updateGeofence = async (geofenceId: string, data: Partial<Geofence>): Promise<void> => {
    try {
      const response = await fetch(`/api/geofences/${geofenceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'UPDATE_GEOFENCE', payload: result.data });
      } else {
        throw new Error(result.message || 'Failed to update geofence');
      }
    } catch (error) {
      console.error('Update geofence error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update geofence' });
    }
  };

  const deleteGeofence = async (geofenceId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/geofences/${geofenceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        dispatch({ 
          type: 'SET_GEOFENCES', 
          payload: state.geofences.filter(g => g.id !== geofenceId) 
        });
      } else {
        throw new Error(result.message || 'Failed to delete geofence');
      }
    } catch (error) {
      console.error('Delete geofence error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete geofence' });
    }
  };

  const triggerSOS = async (vehicleId: string, description?: string): Promise<void> => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/sos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to trigger SOS');
      }
    } catch (error) {
      console.error('Trigger SOS error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to trigger SOS' });
    }
  };

  const selectVehicle = useCallback((vehicleId: string | null) => {
    dispatch({ type: 'SELECT_VEHICLE', payload: vehicleId });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const setTrackingInterval = useCallback((interval: number) => {
    dispatch({ type: 'SET_TRACKING_INTERVAL', payload: interval });
  }, []);

  const contextValue: VTSContextType = {
    ...state,
    loadVehicles,
    updateVehicle,
    immobilizeVehicle,
    controlFuel,
    startTracking,
    stopTracking,
    getVehicleHistory,
    loadAlerts,
    acknowledgeAlert,
    resolveAlert,
    loadGeofences,
    createGeofence,
    updateGeofence,
    deleteGeofence,
    triggerSOS,
    selectVehicle,
    clearError,
    setTrackingInterval,
  };

  return (
    <VTSContext.Provider value={contextValue}>
      {children}
    </VTSContext.Provider>
  );
}

export function useVTS() {
  const context = useContext(VTSContext);
  if (context === undefined) {
    throw new Error('useVTS must be used within a VTSProvider');
  }
  return context;
}