import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { TutorDiscovery } from '@/components/tutor-discovery'

export const dynamic = 'force-dynamic'

export default async function TutorsPage() {
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

  // Fetch available tutors
  const { data: tutors } = await supabase
    .from('tutors')
    .select(`
      id, name, bio, subjects, hourly_rate, location, 
      experience_years, education, is_verified, avatar_url,
      rating, total_reviews
    `)
    .eq('is_active', true)
    .order('rating', { ascending: false })

  // Fetch user's bookings to show which tutors they've worked with
  const { data: userBookings } = await supabase
    .from('bookings')
    .select('tutor_id, status')
    .eq('parent_id', user.id)

  // Fetch user's favorite tutors
  const { data: favorites } = await supabase
    .from('favorite_tutors')
    .select('tutor_id')
    .eq('parent_id', user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Find Tutors</h1>
        <p className="text-gray-600">Discover and connect with qualified tutors for your children</p>
      </div>
      
      <TutorDiscovery 
        tutors={tutors || []}
        userBookings={userBookings || []}
        favorites={favorites || []}
        currentUserId={user.id}
      />
    </div>
  )
}