'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Demo credentials for different user types
  const demoCredentials = [
    {
      role: 'Super Admin',
      email: 'superadmin@itgissolutions.com',
      password: 'admin123',
      description: 'Full system access across all regions',
    },
    {
      role: 'Organization Admin',
      email: 'admin@itgissolutions.com',
      password: 'admin123',
      description: 'Manage vehicles and users for your organization',
    },
    {
      role: 'Fleet Manager',
      email: 'fleet@itgissolutions.com',
      password: 'fleet123',
      description: 'Monitor and manage fleet operations',
    },
    {
      role: 'Customer',
      email: 'customer@itgissolutions.com',
      password: 'customer123',
      description: 'Track your vehicles and view reports',
    },
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">VTS</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to access your VTS dashboard
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="h-11"
                {...register('email')}
                disabled={isLoading || isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="h-11 pr-10"
                  {...register('password')}
                  disabled={isLoading || isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isSubmitting}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
                  disabled={isLoading || isSubmitting}
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                disabled={isLoading || isSubmitting}
              >
                Forgot password?
              </button>
            </div>
          </CardContent>

          <CardFooter className="pt-4">
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium transition-all duration-200"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Demo Credentials */}
      <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800">Demo Access</CardTitle>
          <CardDescription className="text-gray-600">
            Try different user roles with these demo credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {demoCredentials.map((cred, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => fillDemoCredentials(cred.email, cred.password)}
            >
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-800">{cred.role}</div>
                <div className="text-xs text-gray-600">{cred.description}</div>
                <div className="text-xs text-blue-600 mt-1">{cred.email}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-3 h-8 px-3 text-xs"
                onClick={() => fillDemoCredentials(cred.email, cred.password)}
                disabled={isLoading || isSubmitting}
              >
                Use
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="text-center space-y-2">
        <div className="text-xs text-gray-500">
          🔒 Your connection is secured with enterprise-grade encryption
        </div>
        <div className="text-xs text-gray-400">
          Multi-factor authentication available for admin accounts
        </div>
      </div>
    </div>
  );
}