'use client'

import { ReactNode } from 'react'

type RoleGuardProps = {
  /**
   * The roles that are allowed to access the content
   * If not provided, all authenticated users can access the content
   */
  roles?: ('admin' | 'DOE' | 'dispatcher')[]
  /**
   * The content to render if the user has the required role
   */
  children: ReactNode
  /**
   * Optional content to render if the user doesn't have the required role
   * If not provided, nothing will be rendered
   */
  fallback?: ReactNode
  /**
   * Whether to require authentication
   * If true, unauthenticated users will see the fallback content
   * If false, unauthenticated users will see the children
   * @default true
   */
  requireAuth?: boolean
}

/**
 * A component that conditionally renders content based on the user's role
 * Authentication has been removed - this component now always renders children
 */
export function RoleGuard({
  roles,
  children,
  fallback,
  requireAuth = true,
}: RoleGuardProps) {
  // Authentication has been removed
  // Always render the children regardless of roles or authentication
  return <>{children}</>
}
