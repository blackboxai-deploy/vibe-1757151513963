import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { ApiResponse, User, Organization } from '@/types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const JWT_SECRET = process.env.JWT_SECRET || 'vts-secret-key-demo-only';

// Auth user type with password for authentication
interface AuthUser extends User {
  password: string;
}

// Mock user data for demo - In production, this would be from a database
const mockUsers: AuthUser[] = [
  {
    id: 'user_super_admin',
    email: 'superadmin@itgissolutions.com',
    password: 'admin123',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    organizationId: 'org_itgis_global',
    phoneNumber: '+966501234567',
    isActive: true,
    lastLogin: new Date(),
    emergencyContacts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user_org_admin',
    email: 'admin@itgissolutions.com',
    password: 'admin123',
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    role: 'org_admin',
    organizationId: 'org_saudi_branch',
    phoneNumber: '+966502345678',
    isActive: true,
    lastLogin: new Date(),
    emergencyContacts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user_fleet_manager',
    email: 'fleet@itgissolutions.com',
    password: 'fleet123',
    firstName: 'Mohammad',
    lastName: 'Ibrahim',
    role: 'fleet_manager',
    organizationId: 'org_saudi_branch',
    phoneNumber: '+966503456789',
    isActive: true,
    lastLogin: new Date(),
    emergencyContacts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user_customer',
    email: 'customer@itgissolutions.com',
    password: 'customer123',
    firstName: 'Sarah',
    lastName: 'Al-Zahra',
    role: 'customer',
    organizationId: 'org_saudi_branch',
    phoneNumber: '+966504567890',
    isActive: true,
    lastLogin: new Date(),
    emergencyContacts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockOrganizations = [
  {
    id: 'org_itgis_global',
    name: 'IT GIS Solutions - Global',
    region: 'india',
    address: 'Tech Park, Bangalore, India',
    contactEmail: 'global@itgissolutions.com',
    contactPhone: '+91-9876543210',
    timezone: 'Asia/Kolkata',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'org_saudi_branch',
    name: 'IT GIS Solutions - Saudi Arabia',
    region: 'saudi_arabia',
    address: 'Business District, Riyadh, Saudi Arabia',
    contactEmail: 'saudi@itgissolutions.com',
    contactPhone: '+966-501234567',
    timezone: 'Asia/Riyadh',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
] as Organization[];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user by email
    const user = mockUsers.find(u => u.email === email && u.isActive);
    
    if (!user || user.password !== password) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password',
      } as ApiResponse, { status: 401 });
    }

    // Find organization
    const organization = mockOrganizations.find(org => org.id === user.organizationId);
    
    if (!organization) {
      return NextResponse.json({
        success: false,
        message: 'Organization not found',
      } as ApiResponse, { status: 400 });
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        organization,
        token,
        refreshToken,
      },
    } as ApiResponse<{
      user: Omit<User, 'password'>;
      organization: Organization;
      token: string;
      refreshToken: string;
    }>);

  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors.map(e => e.message),
      } as ApiResponse, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    } as ApiResponse, { status: 500 });
  }
}