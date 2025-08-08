import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { AdminInviteManager } from '@/components/admin-invite-manager'

export const dynamic = 'force-dynamic'

export default async function AdminInvitesPage() {
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

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  // Fetch existing invites
  const { data: invites } = await supabase
    .from('admin_invites')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Invites</h1>
        <p className="text-gray-600">Manage admin account invitations</p>
      </div>
      
      <AdminInviteManager invites={invites || []} />
    </div>
  )
}
