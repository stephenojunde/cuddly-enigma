import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { BookingManager } from '@/components/booking-manager'

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
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

  // Fetch bookings based on user type
  let bookingsQuery = supabase
    .from('bookings')
    .select(`
      *,
      tutors (name, subjects, hourly_rate, phone, email),
      profiles!bookings_parent_id_fkey (full_name, email, phone)
    `)

  if (profile?.user_type === 'parent') {
    bookingsQuery = bookingsQuery.eq('parent_id', user.id)
  } else if (profile?.user_type === 'teacher') {
    // Get tutor profile first
    const { data: tutorProfile } = await supabase
      .from('tutors')
      .select('id')
      .eq('profile_id', user.id)
      .single()
    
    if (tutorProfile) {
      bookingsQuery = bookingsQuery.eq('tutor_id', tutorProfile.id)
    }
  }

  const { data: bookings } = await bookingsQuery.order('session_date', { ascending: true })

  // Fetch available tutors for new bookings
  const { data: tutors } = await supabase
    .from('tutors')
    .select('id, name, subjects, hourly_rate, location')
    .eq('is_active', true)
    .eq('is_verified', true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600">Manage your tutoring sessions</p>
      </div>
      
      <BookingManager 
        currentUserId={user.id}
        userType={profile?.user_type || 'parent'}
        bookings={bookings || []} 
        tutors={tutors || []}
      />
    </div>
  )
}
