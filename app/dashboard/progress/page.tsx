import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import ProgressManager from './ProgressManager'

export default async function ProgressPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get all children for this parent
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user.id)
    .order('name')

  // Get progress data for all children
  const { data: progressData } = await supabase
    .from('student_progress')
    .select(`
      *,
      children:student_id (
        id,
        name,
        school_year
      ),
      tutors:tutor_id (
        id,
        name,
        email
      )
    `)
    .in('student_id', children?.map(child => child.id) || [])
    .order('created_at', { ascending: false })

  // Get recent sessions for children
  const { data: recentSessions } = await supabase
    .from('sessions')
    .select(`
      *,
      teacher_students:teacher_student_id (
        id,
        subject,
        children:student_id (
          id,
          name
        ),
        tutors:tutor_id (
          id,
          name
        )
      )
    `)
    .eq('status', 'completed')
    .in('teacher_student_id', 
      await supabase
        .from('teacher_students')
        .select('id')
        .in('student_id', children?.map(child => child.id) || [])
        .then(({ data }) => data?.map(ts => ts.id) || [])
    )
    .order('date', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Academic Progress</h1>
        <p className="text-gray-600">Track your children&apos;s learning journey and achievements</p>
      </div>
      
      <ProgressManager 
        user={user} 
        profile={profile} 
        childrenList={children || []}
        progressData={progressData || []}
        recentSessions={recentSessions || []}
      />
    </div>
  )
}
