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
    console.log("No authenticated user found, redirecting to login page");
    redirect("/auth/signin");
  }

  // Log the user's role for debugging
  console.log(`requireAuth: User role from session: "${session.user.role}" (role type: ${typeof session.user.role})`);

  // If role is undefined, try to set a default role
  if (session.user.role === undefined) {
    console.log("Role is undefined, setting default role to dispatcher");
    session.user.role = "dispatcher";
    console.log(`requireAuth: User role after setting default: "${session.user.role}"`);
  }

  // Log the required role
  if (requiredRole) {
    console.log(`requireAuth: Required role: "${requiredRole}" (role type: ${typeof requiredRole})`);
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
  console.log(`hasRequiredRole: Checking if user role "${userRole}" (type: ${typeof userRole}) has required role "${requiredRole}" (type: ${typeof requiredRole})`);

  // Handle undefined or null userRole
  if (!userRole) {
    console.log(`Access denied: User role is undefined or null, required role is "${requiredRole}"`);
    return false;
  }

  // Defensive: Ensure userRole is a string
  if (typeof userRole !== "string") {
    console.error("hasRequiredRole: userRole is not a string", userRole);
    return false;
  }

  // Convert roles to lowercase for case-insensitive comparison
  const userRoleLower = userRole.toLowerCase();
  console.log(`hasRequiredRole: Converted user role to lowercase: "${userRoleLower}"`);

  // Admin has access to everything
  if (userRoleLower === "admin") {
    console.log(`hasRequiredRole: User has admin role, granting access`);
    return true;
  }

  // Convert requiredRole to lowercase for case-insensitive comparison
  const requiredRoleLower = requiredRole.toLowerCase();
  console.log(`hasRequiredRole: Converted required role to lowercase: "${requiredRoleLower}"`);

  // DOE has access to DOE and dispatcher resources
  // if (userRoleLower === "doe" && (requiredRoleLower === "doe" || requiredRoleLower === "dispatcher")) {
  //   console.log(`hasRequiredRole: User has DOE role and required role is ${requiredRoleLower}, granting access`);
  //   return true;
  // }

  if (userRoleLower === "doe" && (requiredRoleLower === "doe")) {
    console.log(`hasRequiredRole: User has DOE role and required role is ${requiredRoleLower}, granting access`);
    return true;
  }

  // Dispatcher only has access to dispatcher resources
  if (userRoleLower === "dispatcher" && requiredRoleLower === "dispatcher") {
    console.log(`hasRequiredRole: User has dispatcher role and required role is dispatcher, granting access`);
    return true;
  }

  console.log(`Access denied: User role "${userRole}" (${userRoleLower}) does not have access to resources requiring "${requiredRole}" (${requiredRoleLower}) role`);
  return false;
}

/**
 * Returns the permissions for a specific role
 * @param role - The role to get permissions for
 */
export function getRolePermissions(role: Role | string) {
  // Convert role to lowercase for case-insensitive comparison
  const roleLower = typeof role === 'string' ? role.toLowerCase() : role;

  switch (roleLower) {
    case "admin":
      return {
        canViewDashboard: true,
        canManageUsers: true,
        canEditSettings: true,
        canViewReports: true,
        canManageShipments: true,
        canManageTanks: true,
        canDispatch: true,
      };
    case "doe":
      return {
        canViewDashboard: true,
        canManageUsers: false,
        canEditSettings: false,
        canViewReports: true,
        canManageShipments: true,
        canManageTanks: true,
        canDispatch: true,
      };
    case "dispatcher":
      return {
        canViewDashboard: true,
        canManageUsers: false,
        canEditSettings: false,
        canViewReports: true,
        canManageShipments: false,
        canManageTanks: false,
        canDispatch: true,
      };
    default:
      console.log(`Unknown role: "${role}" (${roleLower}), returning default permissions`);
      return {
        canViewDashboard: false,
        canManageUsers: false,
        canEditSettings: false,
        canViewReports: false,
        canManageShipments: false,
        canManageTanks: false,
        canDispatch: false,
      };
  }
}
