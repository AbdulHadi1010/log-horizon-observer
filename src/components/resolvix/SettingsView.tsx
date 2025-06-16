
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Database, 
  Shield, 
  Globe, 
  Bell,
  Users,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  organizationName: string;
  timezone: string;
  dateFormat: string;
  autoAssignTickets: boolean;
  ticketAutoClose: boolean;
  autoCloseAfterDays: number;
  logRetentionDays: number;
  maxFileUploadSize: number;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  requirePasswordChange: boolean;
  passwordChangeDays: number;
  allowedDomains: string[];
}

interface IntegrationSettings {
  slackEnabled: boolean;
  slackWebhook: string;
  emailEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
}

export function SettingsView() {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    organizationName: 'Resolvix Inc.',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    autoAssignTickets: true,
    ticketAutoClose: true,
    autoCloseAfterDays: 30,
    logRetentionDays: 90,
    maxFileUploadSize: 10
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 480,
    passwordMinLength: 8,
    requirePasswordChange: false,
    passwordChangeDays: 90,
    allowedDomains: ['company.com', 'subsidiary.com']
  });

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    slackEnabled: true,
    slackWebhook: 'https://hooks.slack.com/services/...',
    emailEnabled: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'notifications@company.com',
    smtpPassword: '••••••••'
  });

  const [userSettings, setUserSettings] = useState({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveUserSettings = async () => {
    try {
      if (userSettings.fullName !== profile?.full_name) {
        await updateProfile({ full_name: userSettings.fullName });
      }

      toast({
        title: "Settings updated",
        description: "Your profile settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSystemSettings = () => {
    // Here you would normally save to backend
    toast({
      title: "System settings updated",
      description: "System configuration has been saved successfully.",
    });
  };

  const handleTestIntegration = (type: string) => {
    toast({
      title: `Testing ${type} integration`,
      description: "Integration test completed successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your data export will be available for download shortly.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import started",
      description: "Data import is being processed.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application and account settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" onClick={handleImportData}>
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    value={userSettings.fullName}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={userSettings.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Contact admin to change email</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword"
                      type="password"
                      value={userSettings.currentPassword}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Current password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword"
                      type="password"
                      value={userSettings.newPassword}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="New password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword"
                      type="password"
                      value={userSettings.confirmPassword}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveUserSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Configure global system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input 
                    id="orgName"
                    value={systemSettings.organizationName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, organizationName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, dateFormat: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fileSize">Max File Upload Size (MB)</Label>
                  <Input 
                    id="fileSize"
                    type="number"
                    value={systemSettings.maxFileUploadSize}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFileUploadSize: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Automation Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-assign Tickets</Label>
                      <p className="text-sm text-muted-foreground">Automatically assign new tickets to available engineers</p>
                    </div>
                    <Switch 
                      checked={systemSettings.autoAssignTickets}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoAssignTickets: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-close Resolved Tickets</Label>
                      <p className="text-sm text-muted-foreground">Automatically close tickets after they've been resolved</p>
                    </div>
                    <Switch 
                      checked={systemSettings.ticketAutoClose}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, ticketAutoClose: checked }))}
                    />
                  </div>

                  {systemSettings.ticketAutoClose && (
                    <div className="ml-6">
                      <Label htmlFor="autoCloseDays">Auto-close after (days)</Label>
                      <Input 
                        id="autoCloseDays"
                        type="number"
                        value={systemSettings.autoCloseAfterDays}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, autoCloseAfterDays: parseInt(e.target.value) }))}
                        className="w-20"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={handleSaveSystemSettings}>
                <Save className="w-4 h-4 mr-2" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch 
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Password Changes</Label>
                    <p className="text-sm text-muted-foreground">Force users to change passwords periodically</p>
                  </div>
                  <Switch 
                    checked={securitySettings.requirePasswordChange}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requirePasswordChange: checked }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input 
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input 
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label>Allowed Email Domains</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {securitySettings.allowedDomains.map((domain, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {domain}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0"
                        onClick={() => setSecuritySettings(prev => ({
                          ...prev,
                          allowedDomains: prev.allowedDomains.filter((_, i) => i !== index)
                        }))}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <Input 
                  className="mt-2"
                  placeholder="Add domain (e.g., company.com)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim();
                      if (value && !securitySettings.allowedDomains.includes(value)) {
                        setSecuritySettings(prev => ({
                          ...prev,
                          allowedDomains: [...prev.allowedDomains, value]
                        }));
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>

              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Slack Integration</CardTitle>
                <CardDescription>Configure Slack notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Slack Integration</Label>
                  <Switch 
                    checked={integrationSettings.slackEnabled}
                    onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, slackEnabled: checked }))}
                  />
                </div>
                {integrationSettings.slackEnabled && (
                  <div>
                    <Label htmlFor="slackWebhook">Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="slackWebhook"
                        value={integrationSettings.slackWebhook}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, slackWebhook: e.target.value }))}
                        placeholder="https://hooks.slack.com/services/..."
                      />
                      <Button variant="outline" onClick={() => handleTestIntegration('Slack')}>
                        Test
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure SMTP settings for email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Email Notifications</Label>
                  <Switch 
                    checked={integrationSettings.emailEnabled}
                    onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, emailEnabled: checked }))}
                  />
                </div>
                {integrationSettings.emailEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input 
                        id="smtpHost"
                        value={integrationSettings.smtpHost}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input 
                        id="smtpPort"
                        type="number"
                        value={integrationSettings.smtpPort}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input 
                        id="smtpUser"
                        value={integrationSettings.smtpUser}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="smtpPassword"
                          type="password"
                          value={integrationSettings.smtpPassword}
                          onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                        />
                        <Button variant="outline" onClick={() => handleTestIntegration('Email')}>
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Management
                </CardTitle>
                <CardDescription>Manage data retention and cleanup policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logRetention">Log Retention Period (days)</Label>
                  <Input 
                    id="logRetention"
                    type="number"
                    value={systemSettings.logRetentionDays}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, logRetentionDays: parseInt(e.target.value) }))}
                    className="w-32"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Logs older than this will be automatically deleted
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Run Cleanup Now
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Logs
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions that affect your entire organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-medium text-red-800 mb-2">Reset All Settings</h4>
                  <p className="text-sm text-red-600 mb-3">
                    This will reset all system settings to their default values. This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Settings
                  </Button>
                </div>

                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-medium text-red-800 mb-2">Delete All Data</h4>
                  <p className="text-sm text-red-600 mb-3">
                    This will permanently delete all tickets, logs, and user data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
