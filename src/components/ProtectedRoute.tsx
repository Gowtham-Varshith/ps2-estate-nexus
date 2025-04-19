
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/data/mockData";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ["staff", "black", "admin"],
}) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ps2-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Redirect to dashboard if user doesn't have the required role
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
