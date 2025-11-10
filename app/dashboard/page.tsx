import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, MessageSquare, Settings, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

type DashboardSearchParams = {
  message?: string | string[]
}

type Profile = {
  user_type: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  email?: string | null
  [key: string]: unknown
}

interface DashboardPageProps {
  searchParams: Promise<DashboardSearchParams>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  try {
    const params = await searchParams
    const message = Array.isArray(params?.message) ? params.message[0] : params?.message

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) redirect('/login?error=Authentication failed')
    if (!user) redirect('/login')

    let profile: Profile | null = null
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        const pErr = profileError as unknown as { code?: string }
        if (pErr?.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              user_type: user.user_metadata?.user_type || 'parent',
              phone: user.user_metadata?.phone || null,
            })
            .select()
            .single()
          if (!createError) profile = (newProfile as unknown) as Profile
        }
      } else {
        profile = (profileData as unknown) as Profile
      }
    } catch {
      // ignore
    }

    if (!profile) {
      return (
        <div className="space-y-6">
          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{message}</p>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to Your Dashboard</h1>
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Hello, <span className="font-semibold">{user.email}</span>!
              </p>
              <p className="text-gray-600">Your account has been successfully created. We&apos;re setting up your profile.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
                <ul className="text-blue-800 space-y-1">
                  <li>• Browse available tutors</li>
                  <li>• Book your first session</li>
                  <li>• Explore our services</li>
                </ul>
              </div>
              <div className="flex space-x-4 mt-6">
                <Link href="/dashboard/tutors" className="bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-2 px-4 rounded-full transition-all hover:scale-105">Browse Tutors</Link>
                <Link href="/dashboard/profile" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition-all hover:scale-105">Complete Profile</Link>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const welcomeMessage = message && (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-800">{message}</p>
      </div>
    )

    return (
      <div className="space-y-6">
        {welcomeMessage}

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {profile.first_name || user.email}!</h1>
          <p className="text-gray-600">
            {profile.user_type === 'parent' && "Manage your child's tutoring sessions and track progress."}
            {profile.user_type === 'teacher' && 'Manage your tutoring sessions and connect with students.'}
            {profile.user_type === 'school' && "Manage your school's tutoring needs and staff."}
            {!['parent', 'teacher', 'school'].includes(profile.user_type) && 'Welcome to your dashboard.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {profile.user_type === 'parent' && (
                <>
                  <Link href="/dashboard/tutors" className="block w-full bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-2 px-4 rounded-full text-center transition-all hover:scale-105">Find a Tutor</Link>
                  <Link href="/dashboard/bookings" className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full text-center transition-all hover:scale-105">View Bookings</Link>
                  <Link href="/dashboard/children" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-center transition-all hover:scale-105">My Children</Link>
                </>
              )}
              {profile.user_type === 'teacher' && (
                <>
                  <Link href="/dashboard/profile" className="block w-full bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-2 px-4 rounded-full text-center transition-all hover:scale-105">Update Profile</Link>
                  <Link href="/dashboard/schedule" className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full text-center transition-all hover:scale-105">My Schedule</Link>
                  <Link href="/dashboard/students" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-center transition-all hover:scale-105">My Students</Link>
                </>
              )}
              {profile.user_type === 'school' && (
                <>
                  <Link href="/dashboard/teachers" className="block w-full bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-2 px-4 rounded-full text-center transition-all hover:scale-105">Manage Teachers</Link>
                  <Link href="/dashboard/jobs" className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full text-center transition-all hover:scale-105">Job Postings</Link>
                  <Link href="/dashboard/events" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-center transition-all hover:scale-105">Events</Link>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Name:</span> {profile.first_name} {profile.last_name}</p>
              <p><span className="font-medium">Role:</span> <span className="capitalize">{profile.user_type}</span></p>
              {profile.phone && <p><span className="font-medium">Phone:</span> {profile.phone}</p>}
            </div>
            <Link href="/dashboard/profile" className="mt-4 inline-block text-[#8A2BE1] hover:underline">
              Edit Profile →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Account created successfully</li>
              <li>✓ Profile set up</li>
              <li>• Explore dashboard features</li>
              <li>• Complete your profile</li>
              <li>• Contact support if needed</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/messages" className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <MessageSquare className="h-8 w-8 text-[#8A2BE1] mx-auto mb-2" />
              <p className="font-medium text-sm">Messages</p>
            </Link>
            <Link href="/dashboard/resources" className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="h-8 w-8 text-[#8A2BE1] mx-auto mb-2" />
              <p className="font-medium text-sm">Resources</p>
            </Link>
            <Link href="/dashboard/settings" className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="h-8 w-8 text-[#8A2BE1] mx-auto mb-2" />
              <p className="font-medium text-sm">Settings</p>
            </Link>
            <Link href="/dashboard/profile" className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-8 w-8 text-[#8A2BE1] mx-auto mb-2" />
              <p className="font-medium text-sm">Profile</p>
            </Link>
          </div>
        </div>
      </div>
    )
  } catch {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
          <p className="text-gray-600 mb-4">There was an error loading your dashboard. Please try again.</p>
          <Link href="/login" className="bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-2 px-4 rounded-full transition-all hover:scale-105">Back to Login</Link>
        </div>
      </div>
    )
  }
}
