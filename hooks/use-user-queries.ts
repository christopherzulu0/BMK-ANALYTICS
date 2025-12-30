import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  status: "active" | "inactive" | "pending";
  lastLogin?: string;
  createdAt: string;
  location?: string;
  permissions: string[];
  avatar?: string;
  loginCount: number;
  failedLogins: number;
  twoFactorEnabled: boolean;
  sessionActive: boolean;
  notes?: string;
  performance: number;
  tasksCompleted: number;
  lastActivity?: string;
  timezone?: string;
  preferredLanguage?: string;
  securityLevel?: "low" | "medium" | "high";
}

interface ApiResponse<T> {
  success?: boolean;
  data: T[];
  error?: string;
}

// Fetch users data
export function useUsersData() {
  return useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios.get("/api/users");

      // Transform the API response to match the User interface
      const transformedUsers = response.data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        // Use role.name if available, otherwise fallback to roleType or a default
        role: user.role?.name || user.roleType || "User",
        // Set default values for required fields that might be missing
        status: "active", // Default status
        createdAt: user.createdAt || new Date().toISOString(),
        permissions: [], // Default empty permissions
        loginCount: 0,
        failedLogins: 0,
        twoFactorEnabled: false,
        sessionActive: false,
        performance: 0,
        tasksCompleted: 0,
        // Optional fields can be undefined
        department: user.userRoleType?.name || user.DepartmentName || "General",
        location: undefined,
        lastLogin: undefined,
        avatar: undefined,
        notes: undefined,
        lastActivity: undefined,
        timezone: undefined,
        preferredLanguage: undefined,
        securityLevel: undefined,
      }));

      return transformedUsers;
    },
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });
}

// Create a new user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Omit<User, "id" | "createdAt" | "loginCount" | "failedLogins" | "sessionActive" | "performance" | "tasksCompleted" | "lastActivity">) => {
      const response = await axios.post<User>("/api/users", userData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the users query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Update an existing user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userData }: { id: string, userData: Partial<User> }) => {
      const response = await axios.put<User>(`/api/users/${id}`, userData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the users query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Delete a user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete<{ success: boolean }>(`/api/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the users query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Toggle user status (activate/deactivate)
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: "active" | "inactive" }) => {
      const response = await axios.put<User>(`/api/users/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the users query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Batch update user statuses
export function useBatchUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userIds, status }: { userIds: string[], status: "active" | "inactive" }) => {
      const response = await axios.put<{ success: boolean }>(`/api/users/batch/status`, { userIds, status });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the users query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Batch delete users
export function useBatchDeleteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      const response = await axios.post<{ success: boolean }>(`/api/users/batch/delete`, { userIds });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the users query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
