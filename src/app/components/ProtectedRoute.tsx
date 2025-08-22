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

  useEffect(() => {
    const validateAuth = () => {
      console.log("[ProtectedRoute] Validating authentication...");
      
      // Primary check: use authService for comprehensive validation
      const authServiceValid = authService.isAuthenticated();
      
      // Fallback: check Redux token
      const reduxValid = !!reduxToken;
      
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

      console.log("[ProtectedRoute] Auth checks:", {
        authService: authServiceValid,
        redux: reduxValid,
        localStorage: localValid,
      });

      // User is authenticated if any of the checks pass
      const isAuth = authServiceValid || reduxValid || localValid;
      
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

    // Set up periodic validation every 30 seconds
    const interval = setInterval(validateAuth, 30000);
    
    return () => clearInterval(interval);
  }, [router, reduxToken]);

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
