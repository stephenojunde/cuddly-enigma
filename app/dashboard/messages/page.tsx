import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { MessageCenter } from '@/components/message-center'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's messages
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, avatar_url),
      recipient:profiles!messages_recipient_id_fkey(full_name, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Fetch user's contacts (people they've messaged with)
  const { data: contacts } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, user_type')
    .neq('id', user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Communicate with tutors, parents, and schools</p>
      </div>
      
      <MessageCenter 
        currentUserId={user.id} 
        messages={messages || []} 
        contacts={contacts || []}
      />
    </div>
  )
}
