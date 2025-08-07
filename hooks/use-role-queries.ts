import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Type definitions
export interface RoleType {
  id: number;
  name: string;
  description?: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
}

// Fetch role types with their associated roles
export function useRoleTypes() {
  return useQuery<RoleType[], Error>({
    queryKey: ["roleTypes"],
    queryFn: async () => {
      const response = await axios.get("/api/roletypes");
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

// Helper function to get permissions for a role
export function getRolePermissions(roleName: string, roleTypes: RoleType[]) {
  for (const roleType of roleTypes) {
    for (const role of roleType.roles) {
      if (role.name === roleName) {
        return role.permissions || [];
      }
    }
  }
  return [];
}
