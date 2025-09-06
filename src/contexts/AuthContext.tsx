'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Organization, ApiResponse } from '@/types';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
}

interface AuthAction {
  type: 'LOGIN_START' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'REFRESH_TOKEN' | 'CLEAR_ERROR' | 'SET_LOADING';
  payload?: any;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  organization: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  token: null,
  refreshToken: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        organization: action.payload.organization,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        organization: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.message,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'REFRESH_TOKEN':
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Setup token refresh interval
  useEffect(() => {
    if (state.token && state.refreshToken) {
      const interval = setInterval(() => {
        refreshAuth();
      }, 14 * 60 * 1000); // Refresh every 14 minutes

      return () => clearInterval(interval);
    }
  }, [state.token, state.refreshToken]);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('vts_token');
      const refreshToken = localStorage.getItem('vts_refresh_token');
      const userData = localStorage.getItem('vts_user');
      const orgData = localStorage.getItem('vts_organization');

      if (token && refreshToken && userData && orgData) {
        const user = JSON.parse(userData);
        const organization = JSON.parse(orgData);

        // Verify token is still valid
        const isValid = await verifyToken(token);
        
        if (isValid) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user,
              organization,
              token,
              refreshToken,
            },
          });
        } else {
          // Try to refresh token
          await refreshAuth();
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: ApiResponse<{
        user: User;
        organization: Organization;
        token: string;
        refreshToken: string;
      }> = await response.json();

      if (data.success && data.data) {
        // Store auth data in localStorage
        localStorage.setItem('vts_token', data.data.token);
        localStorage.setItem('vts_refresh_token', data.data.refreshToken);
        localStorage.setItem('vts_user', JSON.stringify(data.data.user));
        localStorage.setItem('vts_organization', JSON.stringify(data.data.organization));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: data.data,
        });
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: { message: data.message || 'Login failed' },
        });
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: { message: 'Network error. Please try again.' },
      });
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('vts_token');
    localStorage.removeItem('vts_refresh_token');
    localStorage.removeItem('vts_user');
    localStorage.removeItem('vts_organization');

    dispatch({ type: 'LOGOUT' });
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('vts_refresh_token');
      
      if (!refreshToken) {
        logout();
        return;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data: ApiResponse<{
        token: string;
        refreshToken: string;
      }> = await response.json();

      if (data.success && data.data) {
        localStorage.setItem('vts_token', data.data.token);
        localStorage.setItem('vts_refresh_token', data.data.refreshToken);

        dispatch({
          type: 'REFRESH_TOKEN',
          payload: data.data,
        });
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('vts_user', JSON.stringify(updatedUser));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: updatedUser,
          organization: state.organization,
          token: state.token,
          refreshToken: state.refreshToken,
        },
      });
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshAuth,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function ProtectedComponent(props: T) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook for role-based access control
export function useRole() {
  const { user } = useAuth();
  
  const hasRole = (requiredRole: User['role'] | User['role'][]) => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
  };

  const isSuperAdmin = () => hasRole('super_admin');
  const isOrgAdmin = () => hasRole(['super_admin', 'org_admin']);
  const isFleetManager = () => hasRole(['super_admin', 'org_admin', 'fleet_manager']);
  const canManageVehicles = () => hasRole(['super_admin', 'org_admin', 'fleet_manager']);
  const canViewAllVehicles = () => hasRole(['super_admin', 'org_admin', 'fleet_manager', 'customer']);

  return {
    hasRole,
    isSuperAdmin,
    isOrgAdmin,
    isFleetManager,
    canManageVehicles,
    canViewAllVehicles,
    userRole: user?.role,
  };
}