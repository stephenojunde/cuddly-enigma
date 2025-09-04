import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import DBSVerification from '@/components/dbs-verification'

export const dynamic = 'force-dynamic'

export default async function TutorDBSPage() {
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

  if (profile?.user_type !== 'tutor') {
    redirect('/dashboard')
  }

  // Get tutor record
  const { data: tutor } = await supabase
    .from('tutors')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!tutor) {
    redirect('/dashboard')
  }

  // Get current DBS record
  const { data: currentDBS } = await supabase
    .from('dbs_checks')
    .select('*')
    .eq('tutor_id', tutor.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">DBS Verification</h1>
        <p className="text-gray-600">Manage your DBS (Disclosure and Barring Service) certificate</p>
      </div>
      
      <DBSVerification 
        tutorId={tutor.id}
        currentDBS={currentDBS}
        isAdmin={false}
      />
    </div>
  )
}
