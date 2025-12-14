import { BetterAuthClient } from 'better-auth/react';

// Initialize Better Auth client
export const betterAuthClient = BetterAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000/api/auth',
  fetch: globalThis.fetch,
});

// Export authentication methods
export const { signIn, signOut, useSession } = betterAuthClient;

// Additional authentication utilities
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const session = await betterAuthClient.getSession();
      return !!session?.user;
    } catch {
      return false;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const session = await betterAuthClient.getSession();
      return session?.user || null;
    } catch {
      return null;
    }
  },

  // Sign up helper
  signUp: async (email: string, password: string) => {
    try {
      const response = await betterAuthClient.signUp.email({
        email,
        password,
        callbackURL: '/dashboard',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Sign in helper
  signIn: async (email: string, password: string) => {
    try {
      const response = await betterAuthClient.signIn.email({
        email,
        password,
        callbackURL: '/dashboard',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Sign out helper
  signOut: async () => {
    try {
      await betterAuthClient.signOut();
    } catch (error) {
      throw error;
    }
  },
};