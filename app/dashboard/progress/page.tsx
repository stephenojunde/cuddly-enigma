import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { ProgressTracker } from '@/components/progress-tracker'

export const dynamic = 'force-dynamic'

export default async function ProgressPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's children
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user.id)
    .order('name')

  // Get progress reports for all children
  const childIds = children?.map(child => child.id) || []
  
  const { data: progressReports } = childIds.length > 0 ? await supabase
    .from('progress_reports')
    .select(`
      *,
      children(name, age, grade),
      tutors(name, subjects)
    `)
    .in('child_id', childIds)
    .order('session_date', { ascending: false }) : { data: [] }

  // Get recent bookings for context
  const { data: rawBookings } = await supabase
    .from('bookings')
    .select(`
      id, student_name, subject, session_date, status,
      tutors(name, subjects)
    `)
    .eq('parent_id', user.id)
    .eq('status', 'completed')
    .order('session_date', { ascending: false })
    .limit(10)

  // Transform the bookings to match the expected type
  const recentBookings = rawBookings?.map(booking => ({
    ...booking,
    tutors: Array.isArray(booking.tutors) && booking.tutors.length > 0 
      ? booking.tutors[0] 
      : { name: 'Unknown', subjects: [] }
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
        <p className="text-gray-600">Monitor your children&apos;s academic progress and achievements</p>
      </div>
      
      <ProgressTracker 
        childrenList={children || []}
        progressReports={progressReports || []}
        recentBookings={recentBookings}
        currentUserId={user.id}
      />
    </div>
  )
}