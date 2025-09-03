'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Shield, Bell, Mail, Smartphone, Globe, Trash2, Save, Eye, EyeOff } from 'lucide-react'

interface Profile {
  id: string
  email: string
  notification_settings?: {
    email?: boolean
    sms?: boolean
    push?: boolean
    booking_reminders?: boolean
    message_notifications?: boolean
    marketing_emails?: boolean
  }
  preferences?: {
    theme?: string
    language?: string
    timezone?: string
    currency?: string
  }
}

interface SettingsFormProps {
  user: User
  profile: Profile | null
}

export default function SettingsForm({ user, profile }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const { toast } = useToast()

  // Form states
  const [notifications, setNotifications] = useState({
    email: profile?.notification_settings?.email ?? true,
    sms: profile?.notification_settings?.sms ?? false,
    push: profile?.notification_settings?.push ?? true,
    booking_reminders: profile?.notification_settings?.booking_reminders ?? true,
    message_notifications: profile?.notification_settings?.message_notifications ?? true,
    marketing_emails: profile?.notification_settings?.marketing_emails ?? false,
  })

  const [preferences, setPreferences] = useState({
    theme: profile?.preferences?.theme ?? 'light',
    language: profile?.preferences?.language ?? 'en',
    timezone: profile?.preferences?.timezone ?? 'Europe/London',
    currency: profile?.preferences?.currency ?? 'GBP',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_settings: notifications,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      })
    } catch (error) {
      console.error('Error updating notifications:', error)
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved.",
      })
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })
    } catch (error) {
      console.error('Error updating password:', error)
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    // This would typically involve more complex logic
    toast({
      title: "Account deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'border-[#8A2BE1] text-[#8A2BE1]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bell className="h-4 w-4" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'preferences'
                ? 'border-[#8A2BE1] text-[#8A2BE1]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Globe className="h-4 w-4" />
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-[#8A2BE1] text-[#8A2BE1]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="h-4 w-4" />
            Security
          </button>
        </nav>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Choose how you want to be notified about important events</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNotificationSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-gray-400" />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, sms: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-gray-400" />
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>

                <hr />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Booking Reminders</Label>
                    <p className="text-sm text-gray-500">Get reminded about upcoming sessions</p>
                  </div>
                  <Switch
                    checked={notifications.booking_reminders}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, booking_reminders: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Message Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified about new messages</p>
                  </div>
                  <Switch
                    checked={notifications.message_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, message_notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-500">Receive updates about new features and offers</p>
                  </div>
                  <Switch
                    checked={notifications.marketing_emails}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, marketing_emails: checked }))
                    }
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={preferences.theme} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, theme: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={preferences.language} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, language: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, timezone: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="America/New_York">New York (EST)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={preferences.currency} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, currency: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">£ British Pound</SelectItem>
                      <SelectItem value="USD">$ US Dollar</SelectItem>
                      <SelectItem value="EUR">€ Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
