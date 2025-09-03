import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { StudentManager } from '@/components/student-manager'

export const dynamic = 'force-dynamic'

export default async function StudentsPage() {
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

  // Get tutor profile
  const { data: tutorProfile } = await supabase
    .from('tutors')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!tutorProfile) {
    redirect('/dashboard')
  }

  // Get all students (from bookings)
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, student_name, subject, session_date, status, notes,
      parent_id,
      profiles!bookings_parent_id_fkey(full_name, email, phone)
    `)
    .eq('tutor_id', tutorProfile.id)
    .order('session_date', { ascending: false })

  // Get progress reports for students
  const { data: progressReports } = await supabase
    .from('progress_reports')
    .select(`
      *,
      children(name, age, grade)
    `)
    .eq('tutor_id', tutorProfile.id)
    .order('session_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-600">Manage your students and track their progress</p>
      </div>
      
      <StudentManager 
        tutorId={tutorProfile.id}
        bookings={bookings || []}
        progressReports={progressReports || []}
        currentUserId={user.id}
      />
    </div>
  )
}