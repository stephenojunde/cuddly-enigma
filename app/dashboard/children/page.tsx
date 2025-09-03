import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import ChildrenManager from './ChildrenManager'

export default async function ChildrenPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Get user profile to verify they're a parent
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
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
        <p className="text-gray-600">Manage your children&apos;s profiles and academic progress</p>
      </div>
      
      <ChildrenManager user={user} profile={profile} initialChildren={children || []} />
    </div>
  )
}
