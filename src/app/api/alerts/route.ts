import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Alert } from '@/types';

// Mock alert data for demo
const mockAlerts = [
  {
    id: 'alert_001',
    organizationId: 'org_saudi_branch',
    vehicleId: 'vehicle_001',
    type: 'speeding',
    severity: 'high',
    title: 'Speed Limit Exceeded',
    message: 'Vehicle RYD-001-2024 exceeded speed limit (135 km/h in 120 km/h zone)',
    latitude: 24.7136,
    longitude: 46.6753,
    speed: 135,
    isRead: false,
    isResolved: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: 'alert_002',
    organizationId: 'org_saudi_branch',
    vehicleId: 'vehicle_002',
    type: 'fuel_theft',
    severity: 'critical',
    title: 'Fuel Theft Detected',
    message: 'Sudden fuel level drop detected in vehicle RYD-002-2024 (45L to 20L)',
    latitude: 24.6877,
    longitude: 46.7219,
    isRead: false,
    isResolved: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
  },
  {
    id: 'alert_003',
    organizationId: 'org_saudi_branch',
    vehicleId: 'vehicle_003',
    type: 'geofence_exit',
    severity: 'medium',
    title: 'Geofence Exit',
    message: 'Vehicle JED-003-2024 exited authorized area - Downtown District',
    latitude: 24.7742,
    longitude: 46.7386,
    isRead: true,
    isResolved: false,
    acknowledgedBy: 'user_fleet_manager',
    acknowledgedAt: new Date(Date.now() - 10 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: 'alert_004',
    organizationId: 'org_saudi_branch',
    vehicleId: 'vehicle_001',
    type: 'maintenance_due',
    severity: 'low',
    title: 'Maintenance Due Soon',
    message: 'Vehicle RYD-001-2024 approaching maintenance interval (18,420 km / 20,000 km)',
    latitude: 24.7136,
    longitude: 46.6753,
    isRead: true,
    isResolved: true,
    acknowledgedBy: 'user_fleet_manager',
    acknowledgedAt: new Date(Date.now() - 120 * 60 * 1000),
    resolvedBy: 'user_fleet_manager',
    resolvedAt: new Date(Date.now() - 100 * 60 * 1000),
    createdAt: new Date(Date.now() - 150 * 60 * 1000), // 2.5 hours ago
  },
] as Alert[];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const severity = searchParams.get('severity');
    const isRead = searchParams.get('isRead');
    const isResolved = searchParams.get('isResolved');
    const vehicleId = searchParams.get('vehicleId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let filteredAlerts = mockAlerts;

    // Apply filters
    if (organizationId) {
      filteredAlerts = filteredAlerts.filter(a => a.organizationId === organizationId);
    }

    if (severity) {
      filteredAlerts = filteredAlerts.filter(a => a.severity === severity);
    }

    if (isRead !== null) {
      filteredAlerts = filteredAlerts.filter(a => a.isRead === (isRead === 'true'));
    }

    if (isResolved !== null) {
      filteredAlerts = filteredAlerts.filter(a => a.isResolved === (isResolved === 'true'));
    }

    if (vehicleId) {
      filteredAlerts = filteredAlerts.filter(a => a.vehicleId === vehicleId);
    }

    // Sort by created date (newest first)
    filteredAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedAlerts = filteredAlerts.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedAlerts,
      pagination: {
        page,
        limit,
        total: filteredAlerts.length,
        totalPages: Math.ceil(filteredAlerts.length / limit),
      },
    } as ApiResponse<Alert[]>);

  } catch (error) {
    console.error('Get alerts error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch alerts',
    } as ApiResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock creation of new alert
    const newAlert: Alert = {
      id: `alert_${Date.now()}`,
      organizationId: body.organizationId || 'org_saudi_branch',
      vehicleId: body.vehicleId,
      type: body.type,
      severity: body.severity || 'medium',
      title: body.title,
      message: body.message,
      latitude: body.latitude,
      longitude: body.longitude,
      speed: body.speed,
      isRead: false,
      isResolved: false,
      createdAt: new Date(),
    };

    // In production: Save to database
    mockAlerts.unshift(newAlert); // Add to beginning (newest first)

    return NextResponse.json({
      success: true,
      data: newAlert,
      message: 'Alert created successfully',
    } as ApiResponse<Alert>);

  } catch (error) {
    console.error('Create alert error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create alert',
    } as ApiResponse, { status: 500 });
  }
}