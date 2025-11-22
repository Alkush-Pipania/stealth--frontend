"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth-utils';

/**
 * Hook to redirect authenticated users away from auth pages (signin/signup)
 * Redirects to /dashboard if already logged in
 */
export function useRedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      // Redirect to dashboard
      router.push('/dashboard');
    }
  }, [router]);
}
