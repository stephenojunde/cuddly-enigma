import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get tutor profile if user is a teacher
  let tutorProfile = null
  if (profile?.user_type === 'teacher') {
    const { data } = await supabase
      .from('tutors')
      .select('*')
      .eq('profile_id', user.id)
      .single()
    tutorProfile = data
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>
      
      <ProfileForm 
        user={user}
        profile={profile} 
        tutorProfile={tutorProfile}
      />
    </div>
  )
}
