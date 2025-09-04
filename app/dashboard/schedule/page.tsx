import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { ScheduleManager } from '@/components/schedule-manager'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get tutor profile
  const { data: tutorProfile } = await supabase
    .from('tutors')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!tutorProfile) {
    redirect('/dashboard')
  }

  // Get teacher's schedule
  const { data: schedules } = await supabase
    .from('teacher_schedules')
    .select('*')
    .eq('tutor_id', tutorProfile.id)
    .order('day_of_week')

  // Get teacher's bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      profiles!bookings_parent_id_fkey(full_name, email, phone)
    `)
    .eq('tutor_id', tutorProfile.id)
    .gte('session_date', new Date().toISOString())
    .order('session_date')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-600">Manage your availability and view upcoming sessions</p>
      </div>
      
      <ScheduleManager 
        tutorId={tutorProfile.id}
        schedules={schedules || []}
        bookings={bookings || []}
        currentUserId={user.id}
      />
    </div>
  )
}