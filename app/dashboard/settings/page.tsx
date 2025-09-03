import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile with preferences
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security settings</p>
      </div>
      
      <SettingsForm user={user} profile={profile} />
    </div>
  )
}
