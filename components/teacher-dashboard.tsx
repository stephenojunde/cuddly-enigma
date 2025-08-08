import { createClient } from '@/lib/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, MessageSquare, DollarSign, Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface TeacherDashboardProps {
  user: any
  profile: any
}

export async function TeacherDashboard({ user, profile }: TeacherDashboardProps) {
  const supabase = await createClient()

  // Get tutor profile
  const { data: tutorProfile } = await supabase
    .from('tutors')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!tutorProfile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Tutor Profile</h2>
        <p className="text-gray-600 mb-6">Set up your tutor profile to start receiving bookings</p>
        <Link href="/dashboard/profile">
          <Button>Complete Profile</Button>
        </Link>
      </div>
    )
  }

  // Fetch teacher's bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      profiles!bookings_parent_id_fkey (full_name, email)
    `)
    .eq('tutor_id', tutorProfile.id)
    .order('session_date', { ascending: true })

  // Fetch messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  const upcomingBookings = (bookings || []).filter(booking => 
    booking?.session_date && new Date(booking.session_date) > new Date()
  )

  const thisWeekBookings = (bookings || []).filter(booking => {
    if (!booking?.session_date) return false
    const sessionDate = new Date(booking.session_date)
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return sessionDate >= now && sessionDate <= weekFromNow
  })

  const totalEarnings = (bookings || []).reduce((sum, booking) => {
    if (booking?.status === 'completed' && tutorProfile?.hourly_rate && booking?.duration_minutes) {
      return sum + (tutorProfile.hourly_rate * (booking.duration_minutes / 60))
    }
    return sum
  }, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingBookings.length} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set((bookings || []).map(b => b?.parent_id).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Regular students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              From parents and schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From completed sessions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your tutoring sessions for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {thisWeekBookings.length > 0 ? (
                thisWeekBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{booking.student_name}</p>
                      <p className="text-sm text-gray-600">{booking.subject}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(booking.session_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No sessions scheduled</p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/schedule">
                <Button className="w-full">View Full Schedule</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>Your tutor profile statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Rating</span>
                <span className="text-sm">{tutorProfile.rating}/5.0 ⭐</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Reviews</span>
                <span className="text-sm">{tutorProfile.total_reviews}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Hourly Rate</span>
                <span className="text-sm">£{tutorProfile.hourly_rate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Subjects</span>
                <span className="text-sm">{(tutorProfile?.subjects || []).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={tutorProfile.is_verified ? 'default' : 'secondary'}>
                  {tutorProfile.is_verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full">Edit Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for tutors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/schedule">
              <Button className="w-full h-20 flex flex-col items-center justify-center">
                <Calendar className="h-6 w-6 mb-2" />
                View Schedule
              </Button>
            </Link>
            <Link href="/dashboard/students">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Users className="h-6 w-6 mb-2" />
                My Students
              </Button>
            </Link>
            <Link href="/dashboard/messages">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <MessageSquare className="h-6 w-6 mb-2" />
                Messages
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <BookOpen className="h-6 w-6 mb-2" />
                Find Jobs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
