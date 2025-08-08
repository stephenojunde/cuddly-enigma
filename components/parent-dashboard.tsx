import { createClient } from '@/lib/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, BookOpen, MessageSquare, TrendingUp, Clock, Star } from 'lucide-react'
import Link from 'next/link'

interface ParentDashboardProps {
  user: any
  profile: any
}

export async function ParentDashboard({ user, profile }: ParentDashboardProps) {
  const supabase = await createClient()

  // Fetch parent's bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      tutors (name, subjects, rating)
    `)
    .eq('parent_id', user.id)
    .order('session_date', { ascending: true })
    .limit(5)

  // Fetch student progress
  const { data: progress } = await supabase
    .from('student_progress')
    .select(`
      *,
      tutors (name, subjects)
    `)
    .eq('student_id', user.id)
    .limit(5)

  // Fetch recent messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('recipient_id', user.id)
    .eq('is_read', false)
    .limit(5)

  const upcomingBookings = (bookings || []).filter(booking => 
    booking?.session_date && new Date(booking.session_date) > new Date()
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Next session: {upcomingBookings[0] ? 
                new Date(upcomingBookings[0].session_date).toLocaleDateString() : 
                'None scheduled'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Subjects being tutored
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
              From tutors and schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Across all subjects
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your child's scheduled tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{booking.subject}</p>
                      <p className="text-sm text-gray-600">
                        with {booking.tutors?.name}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(booking.session_date).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming sessions</p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/bookings">
                <Button className="w-full">View All Bookings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Progress</CardTitle>
            <CardDescription>Track your child's academic development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(progress || []).length > 0 ? (
                progress.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.subject || 'Subject not specified'}</p>
                      <p className="text-sm text-gray-600">
                        Current: {item.current_grade || 'N/A'} → Target: {item.target_grade || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        with {item.tutors?.name || 'Tutor not specified'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm">Progress</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No progress data available</p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/progress">
                <Button variant="outline" className="w-full">View Detailed Progress</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for parents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/tutors">
              <Button className="w-full h-20 flex flex-col items-center justify-center">
                <BookOpen className="h-6 w-6 mb-2" />
                Find a Tutor
              </Button>
            </Link>
            <Link href="/dashboard/bookings">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Calendar className="h-6 w-6 mb-2" />
                Schedule Session
              </Button>
            </Link>
            <Link href="/dashboard/messages">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <MessageSquare className="h-6 w-6 mb-2" />
                Message Tutor
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
