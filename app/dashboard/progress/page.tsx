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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      id, student_name, subject, session_date, status,
      tutors(name, subjects)
    `)
    .eq('parent_id', user.id)
    .eq('status', 'completed')
    .order('session_date', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
        <p className="text-gray-600">Monitor your children's academic progress and achievements</p>
      </div>
      
      <ProgressTracker 
        children={children || []}
        progressReports={progressReports || []}
        recentBookings={recentBookings || []}
        currentUserId={user.id}
      />
    </div>
  )
}