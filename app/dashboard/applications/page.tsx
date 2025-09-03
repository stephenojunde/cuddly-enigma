import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { ApplicationManager } from '@/components/application-manager'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
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

  // Get teacher's job applications
  const { data: applications } = await supabase
    .from('job_applications')
    .select(`
      *,
      jobs(title, description, subjects, location, salary_range, requirements, schools(name))
    `)
    .eq('tutor_id', tutorProfile.id)
    .order('applied_at', { ascending: false })

  // Get available jobs that the teacher hasn't applied to yet
  const appliedJobIds = applications?.map(app => app.job_id) || []
  
  const { data: availableJobs } = await supabase
    .from('jobs')
    .select(`
      *,
      schools(name, location)
    `)
    .eq('is_active', true)
    .not('id', 'in', `(${appliedJobIds.join(',') || 'null'})`)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
        <p className="text-gray-600">Track your applications and discover new opportunities</p>
      </div>
      
      <ApplicationManager 
        tutorId={tutorProfile.id}
        applications={applications || []}
        availableJobs={availableJobs || []}
        currentUserId={user.id}
      />
    </div>
  )
}