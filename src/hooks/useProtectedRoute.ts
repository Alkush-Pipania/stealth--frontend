"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth-utils';

/**
 * Hook to protect routes - redirects to /signin if not authenticated
 */
export function useProtectedRoute() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Redirect to login page
      router.push('/signin');
    }
  }, [router]);
}
