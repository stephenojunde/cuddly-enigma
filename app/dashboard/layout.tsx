import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'

type Profile = {
  id: string
  user_type: 'parent' | 'teacher' | 'school' | 'admin'
  is_admin: boolean
  full_name?: string
  avatar_url?: string
  schools?: { name: string }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile with role information
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, schools(name)')
    .eq('id', user.id)
    .single()

  // If profile is missing, don't kick the user back to login; use a safe fallback instead
  const safeProfile: Profile = (profile as unknown as Profile) ?? {
    id: user.id,
    user_type: 'parent',
    is_admin: false,
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar user={user} profile={safeProfile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} profile={safeProfile} currentDate={new Date().toUTCString()} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
