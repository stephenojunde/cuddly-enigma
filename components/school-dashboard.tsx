import { createClient } from '@/lib/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Briefcase, Bell, Calendar, MessageSquare, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface SchoolDashboardProps {
  user: any
  profile: any
}

export async function SchoolDashboard({ user, profile }: SchoolDashboardProps) {
  const supabase = await createClient()

  // Get school information
  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('id', profile.school_id)
    .single()

  // Fetch active job postings
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('school_id', profile.school_id)
    .eq('is_active', true)

  // Fetch school announcements
  const { data: announcements } = await supabase
    .from('school_announcements')
    .select('*')
    .eq('school_id', profile.school_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch upcoming events
  const { data: events } = await supabase
    .from('school_events')
    .select('*')
    .eq('school_id', profile.school_id)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(5)

  // Fetch messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently recruiting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Published announcements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month
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
              From teachers and parents
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
            <CardDescription>Your latest recruitment activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs && jobs.length > 0 ? (
                (jobs || []).slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{job.title || 'Job title not specified'}</p>
                      <p className="text-sm text-gray-600">{job.location || 'Location not specified'}</p>
                      <p className="text-sm text-gray-500">
                        {job.contract_type || 'Contract type not specified'} • {job.subject || 'Subject not specified'}
                      </p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No active job postings</p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/jobs">
                <Button className="w-full">Manage Job Postings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>School events and important dates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events && events.length > 0 ? (
                (events || []).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{event.title || 'Event title not specified'}</p>
                      <p className="text-sm text-gray-600">{event.location || 'Location TBD'}</p>
                      <p className="text-sm text-gray-500">
                        {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Date TBD'}
                      </p>
                    </div>
                    <Badge variant={event.is_public ? 'default' : 'secondary'}>
                      {event.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming events</p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/events">
                <Button variant="outline" className="w-full">Manage Events</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
          <CardDescription>Your school profile and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          {school ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">{school.name}</h3>
                <p className="text-gray-600 mb-2">{school.address}</p>
                <p className="text-gray-600 mb-2">{school.postcode}</p>
                <p className="text-gray-600">{school.phone}</p>
              </div>
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">School Type:</span>
                    <Badge variant="outline" className="capitalize">{school.school_type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Partner Status:</span>
                    <Badge variant={school.is_partner ? 'default' : 'secondary'}>
                      {school.is_partner ? 'Partner' : 'Standard'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">School information not available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for schools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/jobs">
              <Button className="w-full h-20 flex flex-col items-center justify-center">
                <Briefcase className="h-6 w-6 mb-2" />
                Post Job
              </Button>
            </Link>
            <Link href="/dashboard/announcements">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Bell className="h-6 w-6 mb-2" />
                New Announcement
              </Button>
            </Link>
            <Link href="/dashboard/events">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Calendar className="h-6 w-6 mb-2" />
                Create Event
              </Button>
            </Link>
            <Link href="/dashboard/teachers">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Users className="h-6 w-6 mb-2" />
                Manage Staff
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
