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
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('User authentication error:', userError)
      redirect('/login')
    }

    // Try to get user profile, but don't fail if it doesn't exist
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist or there's an error, show a basic dashboard
    if (profileError || !profile) {
      console.log('Profile not found or error:', profileError?.message)
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to Your Dashboard</h1>
                <div className="space-y-4">
                  <p className="text-lg text-gray-700">
                    Hello, <span className="font-semibold">{user.email}</span>!
                  </p>
                  <p className="text-gray-600">
                    Your account has been successfully created and verified. 
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Complete your profile setup</li>
                      <li>• Browse available tutors</li>
                      <li>• Book your first session</li>
                    </ul>
                  </div>
                  <div className="flex space-x-4 mt-6">
                    <a 
                      href="/tutors" 
                      className="bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-2 px-4 rounded-full transition-all hover:scale-105"
                    >
                      Browse Tutors
                    </a>
                    <a 
                      href="/profile" 
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition-all hover:scale-105"
                    >
                      Complete Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Render role-specific dashboard if profile exists
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
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
              <p className="text-gray-600 mb-4">
                There was an error loading your dashboard. Please try again.
              </p>
              <a 
                href="/login" 
                className="bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-2 px-4 rounded-full transition-all hover:scale-105"
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
