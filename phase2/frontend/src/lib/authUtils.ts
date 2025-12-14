import { apiClient } from './api';

// Store the refresh promise to prevent multiple simultaneous refresh requests
let refreshPromise: Promise<boolean> | null = null;

// Function to handle automatic token refresh
export const handleTokenRefresh = async (): Promise<boolean> => {
  // If there's already a refresh in progress, return that promise
  if (refreshPromise) {
    return refreshPromise;
  }

  // Create a new refresh promise
  refreshPromise = apiClient.refreshToken()
    .then(response => {
      refreshPromise = null; // Clear the promise when done
      return response.success;
    })
    .catch(error => {
      refreshPromise = null; // Clear the promise when done
      console.error('Token refresh failed:', error);
      return false;
    });

  return refreshPromise;
};

// Function to check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    // Consider token expired if it expires in the next 5 minutes
    return payload.exp < currentTime + 5 * 60;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // If we can't decode it, assume it's expired
  }
};

// Function to check if we should refresh the token
export const shouldRefreshToken = (): boolean => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return false;
  }
  return isTokenExpired(token);
};