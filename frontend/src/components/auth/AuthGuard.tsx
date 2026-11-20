"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Reusable hook to check authentication status and protect routes.
 * Redirects to welcome/login ("/") when unauthenticated.
 */
export function useAuthGuard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        router.replace("/");
        return false;
      }
      setIsAuthenticated(true);
      return true;
    };

    // Initial check on mount
    checkAuth();

    // Subscribe to store state changes (e.g. when logout is called)
    const unsubscribe = useAppStore.subscribe((state) => {
      if (!state.token && !getAuthToken()) {
        checkAuth();
      }
    });

    // Listen to cross-tab storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "caltrack-storage") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);

  return { isAuthenticated };
}

/**
 * Reusable client-side authentication guard component.
 * Prevents protected content from rendering until authentication is confirmed.
 */
export function AuthGuard({ children, fallback = null }: AuthGuardProps) {
  const { isAuthenticated } = useAuthGuard();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
