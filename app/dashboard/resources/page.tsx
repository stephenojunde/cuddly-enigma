import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { ResourceManager } from '@/components/resource-manager'

export const dynamic = 'force-dynamic'

export default async function ResourcesPage() {
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

  // Fetch public resources and user's own resources
  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .or(`is_public.eq.true,created_by.eq.${user.id}`)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Learning Resources</h1>
        <p className="text-gray-600">Access and share educational materials and resources</p>
      </div>
      
      <ResourceManager 
        resources={resources || []}
        currentUserId={user.id}
        userType={profile?.user_type || 'parent'}
      />
    </div>
  )
}