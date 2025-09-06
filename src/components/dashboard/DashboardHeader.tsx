'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  onMenuToggle: () => void;
  connectionStatus: React.ReactNode;
}

export default function DashboardHeader({ onMenuToggle, connectionStatus }: DashboardHeaderProps) {
  const { user, organization, logout } = useAuth();

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'U';

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <span className="text-lg">☰</span>
          </Button>

          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">VTS</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">VTS Solution</h1>
              <p className="text-xs text-gray-600">IT GIS Solutions</p>
            </div>
          </div>

          {/* Organization Badge */}
          {organization && (
            <Badge variant="outline" className="hidden md:flex text-blue-600 border-blue-200">
              {organization.name}
            </Badge>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          {connectionStatus}

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <span className="text-lg">🔔</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <Badge variant="outline" className="self-start mt-2 text-xs">
                    {user?.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="mr-2">👤</span>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">⚙️</span>
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">🔔</span>
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="mr-2">🌙</span>
                Dark Mode
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">🌐</span>
                Language
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="mr-2">❓</span>
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={logout}
              >
                <span className="mr-2">🚪</span>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Secondary Navigation Bar (Optional) */}
      <div className="bg-gray-50 border-t px-6 py-2 hidden lg:block">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <span>•</span>
            <span>System Status: All Systems Operational</span>
          </div>
          <div className="flex items-center space-x-4">
            {organization && (
              <>
                <span>Region: {organization.region.replace('_', ' ').toUpperCase()}</span>
                <span>•</span>
                <span>Timezone: {organization.timezone}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}