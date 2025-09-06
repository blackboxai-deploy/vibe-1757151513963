// Core VTS Type Definitions for IT GIS Solutions

export interface Organization {
  id: string;
  name: string;
  region: 'india' | 'saudi_arabia' | 'uae' | 'qatar' | 'kuwait' | 'bahrain' | 'oman';
  address: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'org_admin' | 'fleet_manager' | 'driver' | 'customer';
  organizationId: string;
  organization?: Organization;
  phoneNumber: string;
  isActive: boolean;
  lastLogin?: Date;
  emergencyContacts: EmergencyContact[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  organizationId: string;
  organization?: Organization;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  engineNumber: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  fuelCapacity: number;
  currentFuelLevel: number;
  driverId?: string;
  driver?: User;
  deviceId: string;
  isActive: boolean;
  hasImmobilizer: boolean;
  hasFuelControl: boolean;
  hasTemperatureMonitor: boolean;
  maxSpeed: number;
  insuranceExpiry: Date;
  registrationExpiry: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceKm: number;
  currentKm: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleTracking {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  isEngineOn: boolean;
  fuelLevel: number;
  temperature?: number;
  batteryVoltage: number;
  gpsSignalStrength: number;
  timestamp: Date;
}

export interface Geofence {
  id: string;
  organizationId: string;
  organization?: Organization;
  name: string;
  description: string;
  type: 'circular' | 'polygon';
  coordinates: GeofenceCoordinate[];
  radius?: number; // For circular geofences
  isActive: boolean;
  alertOnEntry: boolean;
  alertOnExit: boolean;
  allowedTimeStart?: string; // HH:mm format
  allowedTimeEnd?: string; // HH:mm format
  allowedDays: string[]; // ['monday', 'tuesday', etc.]
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeofenceCoordinate {
  latitude: number;
  longitude: number;
  order: number;
}

export interface Alert {
  id: string;
  organizationId: string;
  organization?: Organization;
  vehicleId: string;
  vehicle?: Vehicle;
  type: 'speeding' | 'geofence_entry' | 'geofence_exit' | 'engine_on' | 'engine_off' | 
        'fuel_theft' | 'towing' | 'panic_button' | 'maintenance_due' | 'low_battery' |
        'unauthorized_movement' | 'harsh_braking' | 'rapid_acceleration' | 'idle_excess';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  latitude: number;
  longitude: number;
  speed?: number;
  geofenceId?: string;
  geofence?: Geofence;
  isRead: boolean;
  isResolved: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface SOSIncident {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  driverId: string;
  driver?: User;
  latitude: number;
  longitude: number;
  status: 'active' | 'acknowledged' | 'resolved' | 'false_alarm';
  description?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  emergencyServices: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FuelTransaction {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  type: 'refuel' | 'consumption' | 'theft_alert';
  amount: number; // in liters
  cost?: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  odometer: number;
  fuelLevelBefore: number;
  fuelLevelAfter: number;
  isAuthorized: boolean;
  authorizedBy?: string;
  createdAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  type: 'routine' | 'repair' | 'inspection' | 'emergency';
  description: string;
  cost: number;
  serviceProvider: string;
  partsReplaced: string[];
  odometerReading: number;
  nextServiceKm?: number;
  nextServiceDate?: Date;
  invoiceNumber?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  organizationId: string;
  organization?: Organization;
  type: 'vehicle_usage' | 'fuel_consumption' | 'maintenance' | 'alerts' | 'driver_behavior' |
        'geofence_violations' | 'speed_violations' | 'idle_time' | 'route_analysis';
  title: string;
  parameters: ReportParameters;
  generatedBy: string;
  generatedAt: Date;
  fileUrl?: string;
  format: 'pdf' | 'excel' | 'csv';
}

export interface ReportParameters {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  vehicleIds?: string[];
  driverIds?: string[];
  geofenceIds?: string[];
  alertTypes?: string[];
  includeCharts: boolean;
  groupBy?: 'vehicle' | 'driver' | 'day' | 'week' | 'month';
}

export interface ChatSession {
  id: string;
  userId: string;
  organizationId: string;
  title: string;
  messages: ChatMessage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    vehicleContext?: string;
    alertContext?: string;
    requestType?: string;
  };
}

export interface SystemConfiguration {
  id: string;
  organizationId: string;
  trackingInterval: number; // seconds
  alertSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    escalationRules: EscalationRule[];
  };
  speedLimits: {
    highway: number;
    cityRoad: number;
    residential: number;
  };
  fuelSettings: {
    lowFuelThreshold: number;
    fuelTheftThreshold: number;
    autoRefuelAlert: boolean;
  };
  maintenanceSettings: {
    reminderDays: number[];
    autoSchedule: boolean;
  };
  aiSettings: {
    enabled: boolean;
    model: string;
    systemPrompt: string;
    responseLanguage: string;
  };
  mapSettings: {
    defaultZoom: number;
    trafficLayer: boolean;
    satelliteView: boolean;
  };
}

export interface EscalationRule {
  alertType: string;
  severity: string;
  timeoutMinutes: number;
  escalateTo: string[];
  channels: ('email' | 'sms' | 'push')[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard Data Types
export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalDistance: number;
  totalAlerts: number;
  criticalAlerts: number;
  fuelConsumption: number;
  avgSpeed: number;
  topSpeed: number;
}

export interface LiveVehicleData {
  vehicle: Vehicle;
  tracking: VehicleTracking;
  alerts: Alert[];
  isInGeofence: boolean;
  currentGeofences: Geofence[];
  driverStatus: 'driving' | 'idle' | 'offline';
  lastUpdate: Date;
}

// Map Component Types
export interface MapMarker {
  id: string;
  position: [number, number];
  type: 'vehicle' | 'geofence' | 'alert' | 'poi';
  data: Vehicle | Geofence | Alert | any;
  icon?: string;
  color?: string;
  popup?: string;
}

export interface RouteData {
  vehicleId: string;
  coordinates: [number, number][];
  timestamps: Date[];
  speeds: number[];
  totalDistance: number;
  totalTime: number;
  avgSpeed: number;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'tracking_update' | 'alert_new' | 'alert_update' | 'vehicle_status' | 'sos_incident';
  payload: any;
  timestamp: Date;
  organizationId: string;
  vehicleId?: string;
}

// Form Validation Schemas
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface VehicleFormData {
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  engineNumber: string;
  fuelType: string;
  fuelCapacity: number;
  driverId?: string;
  deviceId: string;
  maxSpeed: number;
  insuranceExpiry: string;
  registrationExpiry: string;
}

export interface GeofenceFormData {
  name: string;
  description: string;
  type: 'circular' | 'polygon';
  coordinates: GeofenceCoordinate[];
  radius?: number;
  alertOnEntry: boolean;
  alertOnExit: boolean;
  allowedTimeStart?: string;
  allowedTimeEnd?: string;
  allowedDays: string[];
  color: string;
}

export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber: string;
  password?: string;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}