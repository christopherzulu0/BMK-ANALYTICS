"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function PermissionSettings() {
  const [autoExpire, setAutoExpire] = useState(true)
  const [mfaRequired, setMfaRequired] = useState(true)
  const [approvalRequired, setApprovalRequired] = useState(true)
  const [retentionPeriod, setRetentionPeriod] = useState(90)
  const [notifyChanges, setNotifyChanges] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState(30)

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure general permission settings for your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-expire" className="flex flex-col space-y-1">
                  <span>Auto-expire temporary permissions</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Automatically expire temporary permissions after their set duration
                  </span>
                </Label>
                <Switch id="auto-expire" checked={autoExpire} onCheckedChange={setAutoExpire} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Default permission duration</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default role for new users</Label>
              <Select defaultValue="viewer">
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="none">No role (manual assignment)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure security settings for permissions and access control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mfa-required" className="flex flex-col space-y-1">
                  <span>Require MFA for sensitive permissions</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Users must have MFA enabled to be granted sensitive permissions
                  </span>
                </Label>
                <Switch id="mfa-required" checked={mfaRequired} onCheckedChange={setMfaRequired} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="approval-required" className="flex flex-col space-y-1">
                  <span>Require approval for permission changes</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Changes to permissions require approval from an administrator
                  </span>
                </Label>
                <Switch id="approval-required" checked={approvalRequired} onCheckedChange={setApprovalRequired} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout" className="flex flex-col space-y-1">
                <span>Session timeout for elevated permissions (minutes)</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Users with elevated permissions will be logged out after this period of inactivity
                </span>
              </Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="session-timeout"
                  min={5}
                  max={120}
                  step={5}
                  value={[sessionTimeout]}
                  onValueChange={(value) => setSessionTimeout(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{sessionTimeout}</span>
              </div>
            </div>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Security Notice</AlertTitle>
              <AlertDescription>
                Disabling security features may expose your system to unauthorized access. Make sure you understand the
                risks before changing these settings.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure notifications for permission-related events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-changes" className="flex flex-col space-y-1">
                  <span>Notify users of permission changes</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Send email notifications when a user's permissions are changed
                  </span>
                </Label>
                <Switch id="notify-changes" checked={notifyChanges} onCheckedChange={setNotifyChanges} />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Notify administrators about:</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="notify-new-role" defaultChecked />
                  <label htmlFor="notify-new-role" className="text-sm">
                    New role creation
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notify-permission-change" defaultChecked />
                  <label htmlFor="notify-permission-change" className="text-sm">
                    Permission changes
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notify-access-request" defaultChecked />
                  <label htmlFor="notify-access-request" className="text-sm">
                    Access requests
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notify-suspicious" defaultChecked />
                  <label htmlFor="notify-suspicious" className="text-sm">
                    Suspicious activity
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notification channels</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="channel-email" defaultChecked />
                  <label htmlFor="channel-email" className="text-sm">
                    Email
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="channel-slack" defaultChecked />
                  <label htmlFor="channel-slack" className="text-sm">
                    Slack
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="channel-sms" />
                  <label htmlFor="channel-sms" className="text-sm">
                    SMS
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="channel-webhook" />
                  <label htmlFor="channel-webhook" className="text-sm">
                    Webhook
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>Configure advanced permission settings for your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="retention-period" className="flex flex-col space-y-1">
                <span>Audit log retention period (days)</span>
                <span className="font-normal text-xs text-muted-foreground">
                  How long to keep permission change logs before archiving
                </span>
              </Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="retention-period"
                  min={30}
                  max={365}
                  step={30}
                  value={[retentionPeriod]}
                  onValueChange={(value) => setRetentionPeriod(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{retentionPeriod}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Permission inheritance mode</Label>
              <Select defaultValue="restrictive">
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permissive">Permissive (allow by default)</SelectItem>
                  <SelectItem value="restrictive">Restrictive (deny by default)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key for Permission Management</Label>
              <div className="flex space-x-2">
                <Input id="api-key" type="password" value="••••••••••••••••••••••••••••••" readOnly />
                <Button variant="outline" size="sm">
                  Regenerate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This key allows programmatic access to the permission management API
              </p>
            </div>

            <div className="space-y-4">
              <Label>Advanced features:</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature-hierarchy" defaultChecked />
                  <label htmlFor="feature-hierarchy" className="text-sm">
                    Enable role hierarchy
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature-delegation" defaultChecked />
                  <label htmlFor="feature-delegation" className="text-sm">
                    Allow permission delegation
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature-time-based" defaultChecked />
                  <label htmlFor="feature-time-based" className="text-sm">
                    Enable time-based permissions
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature-context" />
                  <label htmlFor="feature-context" className="text-sm">
                    Enable context-aware permissions
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

