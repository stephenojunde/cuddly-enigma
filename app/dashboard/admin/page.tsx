import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, Calendar, TrendingUp, AlertCircle, School, DollarSign, UserPlus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  // Fetch dashboard statistics
  const { data: stats } = await supabase.rpc('get_dashboard_stats')

  // Fetch recent activities
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, full_name, user_type, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      id, student_name, subject, session_date, status,
      tutors(name),
      profiles!bookings_parent_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: pendingApplications } = await supabase
    .from('tutor_applications')
    .select('id, full_name, subjects, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  const dashboardStats = stats || {
    total_users: 0,
    total_tutors: 0,
    total_bookings: 0,
    pending_applications: 0,
    active_sessions: 0,
    total_schools: 0,
    monthly_revenue: 0,
    user_growth: 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of platform metrics and activities</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.total_users}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats.user_growth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.total_tutors}</div>
            <p className="text-xs text-muted-foreground">
              Verified and active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.total_bookings}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.active_sessions} active sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{dashboardStats.monthly_revenue}</div>
            <p className="text-xs text-muted-foreground">
              Current month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Schools</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.total_schools}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.pending_applications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.total_users > 0 ? Math.round((dashboardStats.user_growth / dashboardStats.total_users) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Monthly growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers && recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                      <p className="text-sm text-gray-500 capitalize">{user.user_type}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent users</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings && recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{booking.student_name}</p>
                      <p className="text-sm text-gray-500">
                        {booking.subject} with {booking.tutors?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium capitalize">{booking.status}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.session_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent bookings</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications */}
      {pendingApplications && pendingApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Tutor Applications</CardTitle>
            <CardDescription>Applications requiring review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{application.full_name}</p>
                    <p className="text-sm text-gray-500">
                      Subjects: {Array.isArray(application.subjects) ? application.subjects.join(', ') : application.subjects}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Applied: {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}