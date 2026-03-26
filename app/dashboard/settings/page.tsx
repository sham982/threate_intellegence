import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Key, Bell, Shield, Database, Users } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API credentials for integrations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                value="sk_live_••••••••••••••••••••••••"
                readOnly
              />
              <Button variant="outline">Copy</Button>
              <Button variant="outline">Regenerate</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep this key secret. Never share it publicly.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive alerts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>High-Risk Threats</Label>
              <p className="text-sm text-muted-foreground">Alert on high-risk threat detections</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send alerts to your email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Slack Integration</Label>
              <p className="text-sm text-muted-foreground">Send alerts to Slack channel</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Security Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your security settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Enable Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full">
            View Login History
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Data Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <div>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Control your data and privacy</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Data Retention</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Reports and check history are retained for 90 days by default
            </p>
            <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
              <option>30 days</option>
              <option selected>90 days</option>
              <option>180 days</option>
              <option>1 year</option>
            </select>
          </div>
          <Separator className="my-4" />
          <Button variant="outline" className="w-full text-destructive hover:text-destructive">
            Export All Data
          </Button>
          <Button variant="outline" className="w-full text-destructive hover:text-destructive">
            Delete All Data
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Team Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <div>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Manage team members and permissions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full">
            Invite Team Member
          </Button>
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">admin@example.com</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Owner</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
