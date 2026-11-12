import { useAuthContext } from '../context/AuthContext';

/**
 * Shared auth state ({ user, loading, signUp, signIn, signOut, isConfigured }).
 * Backed by AuthProvider so every component sees the same session.
 */
export const useAuth = () => useAuthContext();
