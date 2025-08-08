import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { ContentManagement } from '@/components/content-management'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
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

  // Fetch content for moderation
  const { data: pendingReviews } = await supabase
    .from('reviews')
    .select('*, tutor:tutors(name), reviewer:profiles(full_name)')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })

  const { data: contactMessages } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  const { data: reportedContent } = await supabase
    .from('content_reports')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600">Moderate content and manage reports</p>
      </div>
      
      <ContentManagement 
        pendingReviews={pendingReviews || []}
        contactMessages={contactMessages || []}
        reportedContent={reportedContent || []}
      />
    </div>
  )
}
