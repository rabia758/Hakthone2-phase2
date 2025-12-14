// API client for frontend
import { User, Task } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Simple in-memory cache for API responses
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // time-to-live in milliseconds
}

class ApiClient {
  private baseUrl: string;
  private cache: Map<string, CacheEntry> = new Map();

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Clear expired cache entries
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Include auth token in headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add JWT token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Make API request with error handling and caching
  private async makeRequest(
    endpoint: string,
    options: RequestInit,
    cacheKey?: string,
    ttl: number = 300000 // 5 minutes default TTL
  ): Promise<any> {
    // Check cache first for GET requests
    if (options.method === 'GET' && cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      const now = Date.now();
      if (now - cached.timestamp < cached.ttl) {
        return cached.data;
      } else {
        // Remove expired cache entry
        this.cache.delete(cacheKey);
      }
    }

    // Try to make the request
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      // If we get a 401 (unauthorized), try to refresh the token and retry
      if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        // Try to refresh the token
        const refreshResponse = await this.refreshToken();

        if (refreshResponse.success) {
          // Retry the original request with the new token
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
              ...this.getHeaders(),
              ...options.headers,
            },
          });

          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }

          const retryData = await retryResponse.json();

          // Cache GET requests
          if (options.method === 'GET' && cacheKey) {
            this.cleanupCache();
            this.cache.set(cacheKey, {
              data: retryData,
              timestamp: Date.now(),
              ttl,
            });
          }

          return retryData;
        } else {
          // If refresh failed, throw an error
          throw new Error('Token refresh failed');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache GET requests
      if (options.method === 'GET' && cacheKey) {
        this.cleanupCache();
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl,
        });
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User authentication methods
  async register(userData: { email: string; password: string }): Promise<{ success: boolean; data?: User; error?: any }> {
    try {
      const result = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return result;
    } catch (error) {
      return { success: false, error };
    }
  }

  async login(credentials: { email: string; password: string }): Promise<{ success: boolean; data?: { user: User; token: string; refresh_token: string }; error?: any }> {
    try {
      const result = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (result.success && result.data && result.data.token) {
        // Store tokens in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', result.data.token);
          if (result.data.refresh_token) {
            localStorage.setItem('refresh_token', result.data.refresh_token);
          }
        }
      }

      return result;
    } catch (error) {
      return { success: false, error };
    }
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async refreshToken(): Promise<{ success: boolean; data?: { user: User; token: string }; error?: any }> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return { success: false, error: 'No refresh token available' };
      }

      const result = await this.makeRequest('/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (result.success && result.data && result.data.token) {
        // Update the auth token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', result.data.token);
        }
      }

      return result;
    } catch (error) {
      // If refresh fails, remove both tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      }
      return { success: false, error };
    }
  }

  // Task management methods
  async getTasks(userId: number, completed?: boolean, limit: number = 50, offset: number = 0): Promise<{ success: boolean; data?: { tasks: Task[]; total: number; limit: number; offset: number }; error?: any }> {
    // Create cache key based on parameters
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    if (completed !== undefined) {
      params.append('completed', completed.toString());
    }
    const queryString = params.toString();
    const cacheKey = `/users/${userId}/tasks?${queryString}`;

    try {
      const result = await this.makeRequest(
        `/${userId}/tasks?${queryString}`,
        { method: 'GET' },
        cacheKey,
        60000 // 1 minute TTL for tasks (frequently changing data)
      );
      return result;
    } catch (error) {
      return { success: false, error };
    }
  }

  async createTask(userId: number, taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<{ success: boolean; data?: Task; error?: any }> {
    try {
      // Clear cache for this user's tasks after creating a new task
      this.cache.delete(`/users/${userId}/tasks?limit=50&offset=0`);
      // Also clear any other cached pages for this user
      for (const key of this.cache.keys()) {
        if (key.startsWith(`/users/${userId}/tasks`)) {
          this.cache.delete(key);
        }
      }

      const result = await this.makeRequest(`/${userId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      return result;
    } catch (error) {
      return { success: false, error };
    }
  }

  async getTask(userId: number, taskId: number): Promise<{ success: boolean; data?: Task; error?: any }> {
    const cacheKey = `/users/${userId}/tasks/${taskId}`;

    try {
      const result = await this.makeRequest(
        `/${userId}/tasks/${taskId}`,
        { method: 'GET' },
        cacheKey,
        300000 // 5 minutes TTL for individual tasks
      );
      return result;
    } catch (error) {
      return { success: false, error };
    }
  }

  async updateTask(userId: number, taskId: number, taskData: Partial<Task>): Promise<{ success: boolean; data?: Task; error?: any }> {
    try {
      // Clear cache for this specific task and user's task list after update
      this.cache.delete(`/users/${userId}/tasks/${taskId}`);
      this.cache.delete(`/users/${userId}/tasks?limit=50&offset=0`);
      // Also clear any other cached pages for this user
      for (const key of this.cache.keys()) {
        if (key.startsWith(`/users/${userId}/tasks`)) {
          this.cache.delete(key);
        }
      }

      const result = await this.makeRequest(`/${userId}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      });
      return result;
    } catch (error) {
      return { success: false, error };
    }
  }

  async deleteTask(userId: number, taskId: number): Promise<{ success: boolean; error?: any }> {
    try {
      // Clear cache for this specific task and user's task list after deletion
      this.cache.delete(`/users/${userId}/tasks/${taskId}`);
      this.cache.delete(`/users/${userId}/tasks?limit=50&offset=0`);
      // Also clear any other cached pages for this user
      for (const key of this.cache.keys()) {
        if (key.startsWith(`/users/${userId}/tasks`)) {
          this.cache.delete(key);
        }
      }

      const result = await this.makeRequest(`/${userId}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      return result;
    } catch (error) {
      return { success: false, error };
    }
  }

  async updateTaskCompletion(userId: number, taskId: number, completed: boolean): Promise<{ success: boolean; data?: Task; error?: any }> {
    try {
      // Clear cache for this specific task and user's task list after completion update
      this.cache.delete(`/users/${userId}/tasks/${taskId}`);
      this.cache.delete(`/users/${userId}/tasks?limit=50&offset=0`);
      // Also clear any other cached pages for this user
      for (const key of this.cache.keys()) {
        if (key.startsWith(`/users/${userId}/tasks`)) {
          this.cache.delete(key);
        }
      }

      const result = await this.makeRequest(`/${userId}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      });
      return result;
    } catch (error) {
      return { success: false, error };
    }
  }
}

export const apiClient = new ApiClient();