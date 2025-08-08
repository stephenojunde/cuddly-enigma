import { createClient } from '@/lib/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Shield, Database, Settings, AlertTriangle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface AdminDashboardProps {
  user: any
  profile: any
}

export async function AdminDashboard({ user, profile }: AdminDashboardProps) {
  const supabase = await createClient()

  // Only allow access to verified admins
  if (!profile.is_admin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have admin privileges.</p>
      </div>
    )
  }

  // Fetch system statistics
  const { data: totalUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })

  const { data: totalTutors } = await supabase
    .from('tutors')
    .select('id', { count: 'exact' })

  const { data: totalSchools } = await supabase
    .from('schools')
    .select('id', { count: 'exact' })

  const { data: totalJobs } = await supabase
    .from('jobs')
    .select('id', { count: 'exact' })

  const { data: pendingApplications } = await supabase
    .from('tutor_applications')
    .select('id', { count: 'exact' })
    .eq('status', 'pending')

  const { data: unreadMessages } = await supabase
    .from('contact_messages')
    .select('id', { count: 'exact' })
    .eq('is_read', false)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center">
          <Shield className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-purple-100">System administration and management</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTutors?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Verified tutors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Schools</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSchools?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total job listings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Items requiring admin attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Tutor Applications</p>
                  <p className="text-sm text-gray-600">Pending verification</p>
                </div>
                <Badge variant="destructive">
                  {pendingApplications?.length || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Contact Messages</p>
                  <p className="text-sm text-gray-600">Unread inquiries</p>
                </div>
                <Badge variant="secondary">
                  {unreadMessages?.length || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Content Reviews</p>
                  <p className="text-sm text-gray-600">Testimonials pending approval</p>
                </div>
                <Badge variant="outline">0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Platform performance and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Status</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Response Time</span>
                <span className="text-sm text-green-600">< 200ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Sessions</span>
                <span className="text-sm">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm">2.3 GB / 10 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>System management and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/admin/users">
              <Button className="w-full h-20 flex flex-col items-center justify-center">
                <Users className="h-6 w-6 mb-2" />
                User Management
              </Button>
            </Link>
            <Link href="/dashboard/admin/content">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Database className="h-6 w-6 mb-2" />
                Content Management
              </Button>
            </Link>
            <Link href="/dashboard/admin/system">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Settings className="h-6 w-6 mb-2" />
                System Monitoring
              </Button>
            </Link>
            <Link href="/dashboard/admin/invites">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Shield className="h-6 w-6 mb-2" />
                Admin Invites
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
