import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export function RequireAuth() {
  const { status, restore } = useAuth();

  useEffect(() => {
    if (status === "idle") restore();
  }, [status, restore]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
