"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/redux/hooks";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // Try Redux first, fallback to localStorage
  const reduxToken = useAppSelector((state) => state.admin.token);
  let localToken: string | null = null;
  if (typeof window !== "undefined") {
    const storedData = localStorage.getItem("userData");
    localToken = JSON.parse(storedData || "null")?.token;
  }
  const token = reduxToken || localToken;

  useEffect(() => {
    // Debug logs
    console.log("[ProtectedRoute] Redux token:", reduxToken);
    console.log("[ProtectedRoute] LocalStorage token:", localToken);
    console.log("[ProtectedRoute] Final token:", token);
    if (!token) {
      router.replace("/login");
    }
  }, [token, router, reduxToken, localToken]);

  if (!token) return null;
  return <>{children}</>;
}
