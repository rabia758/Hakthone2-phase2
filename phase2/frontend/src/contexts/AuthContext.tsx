import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { apiClient } from '../lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthAction {
  type: string;
  payload?: any;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, isLoading: false, isAuthenticated: true, user: action.payload, error: null };
    case 'AUTH_ERROR':
      return { ...state, isLoading: false, isAuthenticated: false, user: null, error: action.payload };
    case 'LOGOUT':
      return { ...state, isLoading: false, isAuthenticated: false, user: null, error: null };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on initial load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Try to validate the token by making a request to a protected endpoint
      // For now, we'll just set the loading state to false since we can't validate without a specific endpoint
      dispatch({ type: 'AUTH_START' });
      // In a real app, you'd call an endpoint to validate the token
      dispatch({ type: 'AUTH_ERROR', payload: null }); // Clear loading state
    }
  }, []);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await apiClient.refreshToken();
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_USER', payload: response.data.user });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiClient.login({ email, password });

      if (response.success && response.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: response.error?.message || 'Login failed' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Login failed' });
    }
  };

  const register = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiClient.register({ email, password });

      if (response.success && response.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: response.error?.message || 'Registration failed' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Registration failed' });
    }
  };

  const logout = async () => {
    await apiClient.logout();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};