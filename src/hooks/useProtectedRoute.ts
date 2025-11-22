"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth-utils';

/**
 * Hook to protect routes - redirects to /signin if not authenticated
 */
export function useProtectedRoute() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      return;
    }

    // Small delay to ensure localStorage is accessible
    const checkAuth = () => {
      const authenticated = isAuthenticated();

      console.log('[useProtectedRoute] Checking authentication:', authenticated);
      console.log('[useProtectedRoute] Token:', localStorage.getItem('auth_token'));

      if (!authenticated) {
        console.warn('[useProtectedRoute] Not authenticated, redirecting to signin');
        router.push('/signin');
      } else {
        console.log('[useProtectedRoute] Authenticated, allowing access');
      }

      setIsChecking(false);
    };

    // Run the check
    checkAuth();
  }, []); // Empty dependency array - only run once on mount
}
