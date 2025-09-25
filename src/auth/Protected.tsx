import { ReactNode } from "react";
import { useAuth } from "../store/useAuth";
import { hasPermission } from "../Utils/auth";
import { Permission } from "../config/permissions";

interface ProtectedProps {
  action: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Protected = ({ action, children, fallback = null }: ProtectedProps) => {
  const { user } = useAuth();

  if (!user) return fallback;
  return hasPermission(user.role, action) ? <>{children}</> : <>{fallback}</>;
};
