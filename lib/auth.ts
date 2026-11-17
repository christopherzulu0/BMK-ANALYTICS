import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Type for allowed roles
type Role = "admin" | "DOE" | "dispatcher";

/**
 * Checks if the user is authenticated and has the required role
 * @param requiredRole - The role required to access the route
 */
export async function requireAuth(requiredRole?: Role) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // If role is undefined, try to set a default role
  if (session.user.role === undefined) {
    session.user.role = "dispatcher";
  }

  // If a specific role is required, check if the user has it
  if (requiredRole && !hasRequiredRole(session.user.role, requiredRole)) {
    redirect(`/auth/error?error=AccessDenied&requiredRole=${requiredRole}&userRole=${session.user.role || 'none'}`);
  }

  return session;
}

/**
 * Checks if the user's role meets the required role
 * @param userRole - The user's role
 * @param requiredRole - The role required to access the resource
 */
export function hasRequiredRole(userRole: string | undefined, requiredRole: Role): boolean {
  if (!userRole || typeof userRole !== "string") {
    return false;
  }

  const userRoleLower = userRole.toLowerCase();
  const requiredRoleLower = requiredRole.toLowerCase();

  if (userRoleLower === "admin") {
    return true;
  }

  if (userRoleLower === "doe" && requiredRoleLower === "doe") {
    return true;
  }

  if (userRoleLower === "dispatcher" && requiredRoleLower === "dispatcher") {
    return true;
  }

  return false;
}

/**
 * Returns the permissions for a specific role
 * @param role - The role to get permissions for
 */
export function getPermissionsForRole(role: string | undefined): string[] {
  if (!role || typeof role !== "string") {
    return [];
  }

  const roleLower = role.toLowerCase();

  if (roleLower === "admin") {
    return ["*"];
  }

  if (roleLower === "doe") {
    return ["read:reports", "read:pipeline", "read:tanks", "write:doe"];
  }

  if (roleLower === "dispatcher") {
    return ["read:pipeline", "write:dispatch", "read:tanks"];
  }

  return [];
}
