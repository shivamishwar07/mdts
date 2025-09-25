import { Permissions, Permission, Role } from "../config/permissions.ts";

export const hasPermission = (role: Role, action: Permission): boolean => {
  const allowedRoles:any = Permissions[action];
  return allowedRoles?.includes(role) ?? false;
};