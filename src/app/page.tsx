'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import Dashboard from '@/components/dashboard/Dashboard';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Redirect based on user role and authentication status
  useEffect(() => {
    if (isAuthenticated && user) {
      // Role-based dashboard redirection
      switch (user.role) {
        case 'super_admin':
          router.push('/admin/super');
          break;
        case 'org_admin':
          router.push('/admin/organization');
          break;
        case 'fleet_manager':
          router.push('/fleet');
          break;
        case 'customer':
          router.push('/tracking');
          break;
        case 'driver':
          router.push('/driver');
          break;
        default:
          // Stay on main dashboard
          break;
      }
    }
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96 shadow-2xl border-0">
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">VTS Solution</h2>
                <p className="text-sm text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">VTS</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">VTS Solution</h1>
                  <p className="text-sm text-gray-600">IT GIS Solutions</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">Multi-Region Support</p>
                  <p className="text-xs text-gray-600">India • Saudi Arabia • UAE • Qatar • Kuwait • Bahrain • Oman</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Hero Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    🚗 Advanced Vehicle Tracking System
                  </div>
                  <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                    Complete Fleet
                    <span className="block text-blue-600">Control Solution</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Real-time vehicle tracking with advanced security controls, fuel management, 
                    geofencing, and AI-powered customer support for comprehensive fleet operations.
                  </p>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xl">🛡️</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">Advanced Security</h3>
                    <p className="text-sm text-gray-600">Immobilizer control, fuel management, SOS alerts</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-xl">🗺️</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">Real-time Tracking</h3>
                    <p className="text-sm text-gray-600">GPS monitoring, geofencing, route optimization</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 text-xl">⚡</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">Fuel Control</h3>
                    <p className="text-sm text-gray-600">Consumption monitoring, theft detection, remote control</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xl">🤖</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">AI Support</h3>
                    <p className="text-sm text-gray-600">24/7 intelligent customer assistance</p>
                  </div>
                </div>

                {/* Company Info */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3">Trusted Across Regions</h3>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-blue-600">7</div>
                      <div className="text-xs text-gray-600">Countries</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-green-600">24/7</div>
                      <div className="text-xs text-gray-600">Monitoring</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-purple-600">AI</div>
                      <div className="text-xs text-gray-600">Support</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-orange-600">30s</div>
                      <div className="text-xs text-gray-600">Updates</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Login Form */}
              <div className="lg:pl-8">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <span>© 2024 IT GIS Solutions</span>
                <span>•</span>
                <span>Vehicle Tracking System</span>
                <span>•</span>
                <span>Multi-Region Support</span>
              </div>
              <div className="text-xs text-gray-500">
                Operating across India, Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, and Oman
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated user - show main dashboard
  return <Dashboard />;
}