// src/routes/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { hasPermission } from "../Utils/auth";
import { Permission } from "../config/permissions";

type ProtectedRouteProps = {
  children: JSX.Element;
  redirectPath?: string;
  checkAuthAsync?: () => Promise<boolean>;
  action?: Permission;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectPath = "/home",
  checkAuthAsync,
  action,
}) => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = () => {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) {
        setIsAllowed(false);
        return;
      }
      const user = JSON.parse(rawUser);

      if (action) {
        setIsAllowed(hasPermission(user.role, action));
      } else {
        setIsAllowed(true);
      }
    };

    if (!checkAuthAsync) {
      checkAccess();
    }
  }, [checkAuthAsync, action]);

  useEffect(() => {
    if (checkAuthAsync) {
      const asyncAuthCheck = async () => {
        try {
          const authenticated = await checkAuthAsync();
          setIsAllowed(authenticated);
        } catch (error) {
          setIsAllowed(false);
        }
      };
      asyncAuthCheck();
    }
  }, [checkAuthAsync]);

  if (isAllowed === null) {
    return <div>Loading...</div>;
  }

  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;