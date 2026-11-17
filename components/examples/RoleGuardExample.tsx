'use client'

import { RoleGuard } from '../RoleGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldAlert, ShieldCheck, UserCircle } from 'lucide-react'

/**
 * Example component demonstrating how to use the RoleGuard component
 */
export function RoleGuardExample() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Role Guard Examples</h1>

      {/* Example 1: Content only visible to admins */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Only Content</CardTitle>
          <CardDescription>This content is only visible to users with the admin role</CardDescription>
        </CardHeader>
        <CardContent>
          <RoleGuard
            roles={['admin']}
            fallback={
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  You need admin privileges to view this content.
                </AlertDescription>
              </Alert>
            }
          >
            <Alert className="bg-green-50 border-green-200">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Admin Content</AlertTitle>
              <AlertDescription className="text-green-700">
                This content is only visible to administrators.
              </AlertDescription>
            </Alert>
          </RoleGuard>
        </CardContent>
      </Card>

      {/* Example 2: Content visible to DOE and admin */}
      <Card>
        <CardHeader>
          <CardTitle>DOE and Admin Content</CardTitle>
          <CardDescription>This content is visible to users with DOE or admin roles</CardDescription>
        </CardHeader>
        <CardContent>
          <RoleGuard
            roles={['DOE']}
            fallback={
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  You need DOE or admin privileges to view this content.
                </AlertDescription>
              </Alert>
            }
          >
            <Alert className="bg-blue-50 border-blue-200">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">DOE Content</AlertTitle>
              <AlertDescription className="text-blue-700">
                This content is visible to DOE and admin users.
              </AlertDescription>
            </Alert>
          </RoleGuard>
        </CardContent>
      </Card>

      {/* Example 3: Content visible to any authenticated user */}
      <Card>
        <CardHeader>
          <CardTitle>Authenticated Users Only</CardTitle>
          <CardDescription>This content is visible to any authenticated user</CardDescription>
        </CardHeader>
        <CardContent>
          <RoleGuard
            fallback={
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  You need to be logged in to view this content.
                </AlertDescription>
              </Alert>
            }
          >
            <Alert className="bg-purple-50 border-purple-200">
              <UserCircle className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-800">Authenticated Content</AlertTitle>
              <AlertDescription className="text-purple-700">
                This content is visible to any authenticated user.
              </AlertDescription>
            </Alert>
          </RoleGuard>
        </CardContent>
      </Card>

      {/* Example 4: Multiple roles */}
      <Card>
        <CardHeader>
          <CardTitle>Multiple Roles</CardTitle>
          <CardDescription>This content is visible to users with dispatcher or DOE roles</CardDescription>
        </CardHeader>
        <CardContent>
          <RoleGuard
            roles={['dispatcher', 'DOE']}
            fallback={
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  You need dispatcher or DOE privileges to view this content.
                </AlertDescription>
              </Alert>
            }
          >
            <Alert className="bg-amber-50 border-amber-200">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Multiple Roles Content</AlertTitle>
              <AlertDescription className="text-amber-700">
                This content is visible to dispatcher and DOE users (and admins).
              </AlertDescription>
            </Alert>
          </RoleGuard>
        </CardContent>
      </Card>
    </div>
  )
}
