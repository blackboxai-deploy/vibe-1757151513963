import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Vehicle } from '@/types';

// Mock vehicle data for demo
const mockVehicles = [
  {
    id: 'vehicle_001',
    organizationId: 'org_saudi_branch',
    licensePlate: 'RYD-001-2024',
    make: 'Toyota',
    model: 'Hilux',
    year: 2024,
    color: 'White',
    vin: 'JTMHY7AJ8K4000001',
    engineNumber: 'ENG-001-2024',
    fuelType: 'diesel',
    fuelCapacity: 80,
    currentFuelLevel: 75,
    deviceId: 'DEV-001-GPS',
    isActive: true,
    hasImmobilizer: true,
    hasFuelControl: true,
    hasTemperatureMonitor: false,
    maxSpeed: 120,
    insuranceExpiry: new Date('2025-12-31'),
    registrationExpiry: new Date('2025-06-30'),
    currentKm: 15420,
    nextMaintenanceKm: 20000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: 'vehicle_002',
    organizationId: 'org_saudi_branch',
    licensePlate: 'RYD-002-2024',
    make: 'Ford',
    model: 'Transit',
    year: 2023,
    color: 'Blue',
    vin: 'WF0EXXTTGENA00002',
    engineNumber: 'ENG-002-2023',
    fuelType: 'diesel',
    fuelCapacity: 70,
    currentFuelLevel: 45,
    deviceId: 'DEV-002-GPS',
    isActive: true,
    hasImmobilizer: true,
    hasFuelControl: true,
    hasTemperatureMonitor: true,
    maxSpeed: 100,
    insuranceExpiry: new Date('2025-08-15'),
    registrationExpiry: new Date('2025-03-20'),
    currentKm: 32150,
    nextMaintenanceKm: 35000,
    createdAt: new Date('2023-08-20'),
    updatedAt: new Date(),
  },
  {
    id: 'vehicle_003',
    organizationId: 'org_saudi_branch',
    licensePlate: 'JED-003-2024',
    make: 'Mercedes-Benz',
    model: 'Sprinter',
    year: 2024,
    color: 'Silver',
    vin: 'WDF90647111234567',
    engineNumber: 'ENG-003-2024',
    fuelType: 'diesel',
    fuelCapacity: 90,
    currentFuelLevel: 88,
    deviceId: 'DEV-003-GPS',
    isActive: true,
    hasImmobilizer: true,
    hasFuelControl: true,
    hasTemperatureMonitor: true,
    maxSpeed: 110,
    insuranceExpiry: new Date('2026-01-10'),
    registrationExpiry: new Date('2025-07-15'),
    currentKm: 8750,
    nextMaintenanceKm: 15000,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
] as Vehicle[];

export async function GET(request: NextRequest) {
  try {
    // In production, you would:
    // 1. Verify JWT token
    // 2. Check user permissions
    // 3. Filter vehicles by organization
    // 4. Apply pagination and sorting

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredVehicles = mockVehicles;

    if (organizationId) {
      filteredVehicles = mockVehicles.filter(v => v.organizationId === organizationId);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedVehicles,
      pagination: {
        page,
        limit,
        total: filteredVehicles.length,
        totalPages: Math.ceil(filteredVehicles.length / limit),
      },
    } as ApiResponse<Vehicle[]>);

  } catch (error) {
    console.error('Get vehicles error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch vehicles',
    } as ApiResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // In production, you would:
    // 1. Verify JWT token
    // 2. Validate user permissions
    // 3. Validate request data
    // 4. Save to database

    const body = await request.json();
    
    // Mock creation
    const newVehicle: Vehicle = {
      id: `vehicle_${Date.now()}`,
      organizationId: body.organizationId || 'org_saudi_branch',
      ...body,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In production: Save to database
    mockVehicles.push(newVehicle);

    return NextResponse.json({
      success: true,
      data: newVehicle,
      message: 'Vehicle created successfully',
    } as ApiResponse<Vehicle>);

  } catch (error) {
    console.error('Create vehicle error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create vehicle',
    } as ApiResponse, { status: 500 });
  }
}