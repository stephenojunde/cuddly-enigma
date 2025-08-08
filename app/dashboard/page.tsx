import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { ParentDashboard } from '@/components/parent-dashboard'
import { TeacherDashboard } from '@/components/teacher-dashboard'
import { SchoolDashboard } from '@/components/school-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'

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
        return <AdminDashboard user={user} profile={profile} />
      }
      return <ParentDashboard user={user} profile={profile} />
  }
}
