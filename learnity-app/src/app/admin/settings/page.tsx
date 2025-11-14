'use client';

/**
 * Admin Settings Page
 * Platform configuration and system settings management
 */

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Shield,
  Bell,
  Mail,
  Database,
  Key,
  Globe,
  Users,
  DollarSign,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';

interface PlatformSettings {
  general: {
    platformName: string;
    platformDescription: string;
    supportEmail: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    maxUsersPerSession: number;
  };
  security: {
    passwordMinLength: number;
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    adminAlerts: boolean;
    securityAlerts: boolean;
  };
  payment: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    minimumPayment: number;
    platformFee: number;
    autoPayouts: boolean;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    general: {
      platformName: 'Learnity',
      platformDescription: 'Connect with expert tutors for personalized learning',
      supportEmail: 'support@learnity.com',
      maintenanceMode: false,
      registrationEnabled: true,
      maxUsersPerSession: 50
    },
    security: {
      passwordMinLength: 8,
      requireEmailVerification: true,
      enableTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      adminAlerts: true,
      securityAlerts: true
    },
    payment: {
      stripeEnabled: true,
      paypalEnabled: false,
      minimumPayment: 10,
      platformFee: 15,
      autoPayouts: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  
  const api = useAuthenticatedApi();
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/settings');
      if (response.settings) {
        setSettings(response.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: "Warning",
        description: "Using default settings. Could not load saved configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.post('/api/admin/settings', { settings });
      toast({
        title: "Settings Saved",
        description: "Platform settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof PlatformSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      fetchSettings();
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to default values.",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings" description="Platform configuration and system settings">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Platform Settings"
      description="Configure system-wide settings and preferences"
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button size="sm" onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Platform Information</span>
              </CardTitle>
              <CardDescription>
                Basic platform configuration and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.general.platformName}
                    onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
                    placeholder="Enter platform name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                    placeholder="support@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platformDescription">Platform Description</Label>
                <textarea
                  id="platformDescription"
                  value={settings.general.platformDescription}
                  onChange={(e) => updateSetting('general', 'platformDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe your platform..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Max Users per Session</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={settings.general.maxUsersPerSession}
                    onChange={(e) => updateSetting('general', 'maxUsersPerSession', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="maintenanceMode" className="flex items-center space-x-2">
                    <span>Maintenance Mode</span>
                    {settings.general.maintenanceMode && (
                      <Badge variant="destructive">Active</Badge>
                    )}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="registrationEnabled"
                    checked={settings.general.registrationEnabled}
                    onChange={(e) => updateSetting('general', 'registrationEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="registrationEnabled" className="flex items-center space-x-2">
                    <span>Allow New Registrations</span>
                    {settings.general.registrationEnabled ? (
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    ) : (
                      <Badge variant="destructive">Disabled</Badge>
                    )}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Configuration</span>
              </CardTitle>
              <CardDescription>
                Authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                    min="6"
                    max="32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="1440"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={settings.security.lockoutDuration}
                    onChange={(e) => updateSetting('security', 'lockoutDuration', parseInt(e.target.value))}
                    min="5"
                    max="60"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireEmailVerification"
                    checked={settings.security.requireEmailVerification}
                    onChange={(e) => updateSetting('security', 'requireEmailVerification', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="requireEmailVerification" className="flex items-center space-x-2">
                    <span>Require Email Verification</span>
                    {settings.security.requireEmailVerification && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableTwoFactor"
                    checked={settings.security.enableTwoFactor}
                    onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="enableTwoFactor" className="flex items-center space-x-2">
                    <span>Enable Two-Factor Authentication</span>
                    {settings.security.enableTwoFactor ? (
                      <Lock className="h-4 w-4 text-green-600" />
                    ) : (
                      <Unlock className="h-4 w-4 text-gray-400" />
                    )}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Configure system-wide notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">User Notifications</h4>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="emailNotifications" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Notifications</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pushNotifications"
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="pushNotifications" className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <span>Push Notifications</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      checked={settings.notifications.smsNotifications}
                      onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="smsNotifications" className="flex items-center space-x-2">
                      <span>SMS Notifications</span>
                      <Badge variant="outline">Premium</Badge>
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Admin Alerts</h4>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="adminAlerts"
                      checked={settings.notifications.adminAlerts}
                      onChange={(e) => updateSetting('notifications', 'adminAlerts', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="adminAlerts" className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>General Admin Alerts</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="securityAlerts"
                      checked={settings.notifications.securityAlerts}
                      onChange={(e) => updateSetting('notifications', 'securityAlerts', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="securityAlerts" className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Security Alerts</span>
                      <Badge className="bg-red-100 text-red-800">Critical</Badge>
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Payment Configuration</span>
              </CardTitle>
              <CardDescription>
                Payment processing and fee settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minimumPayment">Minimum Payment ($)</Label>
                  <Input
                    id="minimumPayment"
                    type="number"
                    value={settings.payment.minimumPayment}
                    onChange={(e) => updateSetting('payment', 'minimumPayment', parseFloat(e.target.value))}
                    min="1"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platformFee">Platform Fee (%)</Label>
                  <Input
                    id="platformFee"
                    type="number"
                    value={settings.payment.platformFee}
                    onChange={(e) => updateSetting('payment', 'platformFee', parseFloat(e.target.value))}
                    min="0"
                    max="50"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Payment Providers</h4>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="stripeEnabled"
                    checked={settings.payment.stripeEnabled}
                    onChange={(e) => updateSetting('payment', 'stripeEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="stripeEnabled" className="flex items-center space-x-2">
                    <span>Stripe</span>
                    {settings.payment.stripeEnabled && (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    )}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="paypalEnabled"
                    checked={settings.payment.paypalEnabled}
                    onChange={(e) => updateSetting('payment', 'paypalEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="paypalEnabled" className="flex items-center space-x-2">
                    <span>PayPal</span>
                    {settings.payment.paypalEnabled && (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    )}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoPayouts"
                    checked={settings.payment.autoPayouts}
                    onChange={(e) => updateSetting('payment', 'autoPayouts', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="autoPayouts" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Automatic Payouts</span>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Advanced Configuration</span>
              </CardTitle>
              <CardDescription>
                System-level settings and API configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Advanced Settings</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      These settings can affect system functionality. Only modify if you understand the implications.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">API Keys</h4>
                    <p className="text-sm text-gray-500">Manage external service API keys</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                  >
                    {showApiKeys ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide Keys
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show Keys
                      </>
                    )}
                  </Button>
                </div>

                {showApiKeys && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="stripeKey">Stripe Secret Key</Label>
                      <Input
                        id="stripeKey"
                        type="password"
                        placeholder="sk_test_..."
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firebaseKey">Firebase Admin Key</Label>
                      <Input
                        id="firebaseKey"
                        type="password"
                        placeholder="Firebase service account key"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">System Maintenance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restart Services
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Key className="h-4 w-4 mr-2" />
                      Rotate API Keys
                    </Button>
                    <Button variant="outline" className="justify-start text-red-600 border-red-200 hover:bg-red-50">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      System Reset
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}