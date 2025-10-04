import { useState, useEffect } from "react";
import { Role } from "../config/permissions";

export interface User {
  id: number;
  name: string;
  role: Role;
  email: string;
  // ... other fields you saved
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      setUser(JSON.parse(rawUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return { user, setUser, logout };
};
