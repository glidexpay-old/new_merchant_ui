"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/redux/hooks";
import { authService } from "@/app/utils/sessionManager";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Get Redux token as fallback
  const reduxToken = useAppSelector((state) => state.admin.token);

  // Initial validation effect - runs once on mount
  useEffect(() => {
    const validateAuth = async () => {
      console.log("[ProtectedRoute] Initial validation...");
      
      // Wait a brief moment for Redux hydration to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Primary check: use authService for comprehensive validation
      const authServiceValid = authService.isAuthenticated();
      
      // Fallback: check localStorage directly (in case authService fails)
      let localValid = false;
      if (typeof window !== "undefined") {
        try {
          const storedData = localStorage.getItem("userData");
          const userData = storedData ? JSON.parse(storedData) : null;
          
          if (userData?.token && userData?.sessionExpiryDate) {
            const expiryTime = new Date(userData.sessionExpiryDate).getTime();
            const currentTime = Date.now();
            localValid = currentTime < expiryTime;
          }
        } catch (error) {
          console.error("[ProtectedRoute] Error checking localStorage:", error);
          localValid = false;
        }
      }

      console.log("[ProtectedRoute] Initial auth checks:", {
        authService: authServiceValid,
        localStorage: localValid,
      });

      // User is authenticated if any of the checks pass
      const isAuth = authServiceValid || localValid;
      
      if (!isAuth) {
        console.log("[ProtectedRoute] User not authenticated, redirecting to login");
        router.replace("/login");
      } else {
        console.log("[ProtectedRoute] User authenticated");
        setIsAuthenticated(true);
      }
      
      setIsValidating(false);
    };

    validateAuth();
  }, [router]);

  // Monitor Redux token changes
  useEffect(() => {
    if (isValidating) return; // Skip if still in initial validation
    
    console.log("[ProtectedRoute] Redux token changed:", { hasToken: !!reduxToken });
    
    // If Redux token becomes available and we're not authenticated, re-validate
    if (reduxToken && !isAuthenticated) {
      console.log("[ProtectedRoute] Redux token available, setting authenticated");
      setIsAuthenticated(true);
    }
    // If Redux token is removed and we were authenticated, check other sources
    else if (!reduxToken && isAuthenticated) {
      const authServiceValid = authService.isAuthenticated();
      if (!authServiceValid) {
        console.log("[ProtectedRoute] No valid authentication found, redirecting to login");
        setIsAuthenticated(false);
        router.replace("/login");
      }
    }
  }, [reduxToken, isAuthenticated, isValidating, router]);

  // Periodic validation every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAuthenticated) return; // Skip if not authenticated
      
      console.log("[ProtectedRoute] Periodic validation...");
      const authServiceValid = authService.isAuthenticated();
      
      if (!authServiceValid) {
        console.log("[ProtectedRoute] Periodic check failed, redirecting to login");
        setIsAuthenticated(false);
        router.replace("/login");
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating session...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}
