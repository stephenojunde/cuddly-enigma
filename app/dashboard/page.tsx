import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { ParentDashboard } from '@/components/parent-dashboard'
import { TeacherDashboard } from '@/components/teacher-dashboard'
import { SchoolDashboard } from '@/components/school-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'

export const dynamic = 'force-dynamic'

async function getAdminStats(supabase: any) {
  const [
    { count: totalUsers },
    { count: totalTutors },
    { count: totalSchools },
    { count: totalJobs },
    { count: pendingApplications },
    { count: unreadMessages }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('tutors').select('*', { count: 'exact', head: true }),
    supabase.from('schools').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('tutor_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false)
  ])

  return {
    totalUsers: totalUsers || 0,
    totalTutors: totalTutors || 0,
    totalSchools: totalSchools || 0,
    totalJobs: totalJobs || 0,
    pendingApplications: pendingApplications || 0,
    unreadMessages: unreadMessages || 0
  }
}

export default async function DashboardPage() {
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

  if (!profile) {
    redirect('/login')
  }

  // Render role-specific dashboard
  switch (profile.user_type) {
    case 'parent':
      return <ParentDashboard user={user} profile={profile} />
    case 'teacher':
      return <TeacherDashboard user={user} profile={profile} />
    case 'school':
      return <SchoolDashboard user={user} profile={profile} />
    default:
      if (profile.is_admin) {
        const stats = await getAdminStats(supabase)
        return <AdminDashboard user={user} profile={profile} stats={stats} />
      }
      return <ParentDashboard user={user} profile={profile} />
  }
}
