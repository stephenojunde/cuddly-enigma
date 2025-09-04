"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/client'
import { Calendar, Clock, User, MapPin, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface BookingSystemProps {
  tutorId?: string
  parentId?: string
  mode?: 'create' | 'manage' | 'view'
}

interface Child {
  id: string
  name: string
  age?: number
  school_year?: string
  subjects_of_interest?: string[]
}

interface Tutor {
  id: string
  name: string
  subjects: string[]
  hourly_rate?: number
  profile_id: string
}

interface Booking {
  id: string
  parent_id: string
  tutor_id: string
  child_id: string
  subject: string
  session_type: 'regular' | 'trial' | 'assessment' | 'makeup'
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  session_format: 'online' | 'in-person' | 'hybrid'
  location?: string
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled'
  session_fee?: number
  booking_reference?: string
  parent_confirmed: boolean
  tutor_confirmed: boolean
  special_requirements?: string
  child?: Child
  tutor?: { name: string; profile_id: string }
}

export default function BookingSystem({ tutorId, parentId, mode = 'create' }: BookingSystemProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  // Form state for creating new booking
  const [formData, setFormData] = useState({
    tutor_id: tutorId || '',
    child_id: '',
    subject: '',
    session_type: 'regular' as const,
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    session_format: 'online' as const,
    location: '',
    special_requirements: '',
    session_fee: 0
  })

  useEffect(() => {
    if (mode === 'create' || mode === 'manage') {
      loadInitialData()
    } else if (mode === 'view') {
      loadBookings()
    }
  }, [mode, tutorId, parentId])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please log in to access bookings')
        return
      }

      // Load user profile to determine user type
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.user_type === 'parent') {
        // Load children for parent
        const { data: childrenData } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', user.id)

        setChildren(childrenData || [])

        // Load available tutors
        const { data: tutorsData } = await supabase
          .from('tutors')
          .select('id, name, subjects, hourly_rate, profile_id')
          .eq('is_active', true)

        setTutors(tutorsData || [])
      }

      // Load existing bookings
      await loadBookings()
    } catch (err) {
      setError('Failed to load booking data')
      console.error('Error loading initial data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('bookings')
        .select(`
          *,
          child:children(id, name, age, school_year),
          tutor:profiles!tutor_id(id, full_name)
        `)

      if (tutorId) {
        query = query.eq('tutor_id', tutorId)
      } else if (parentId) {
        query = query.eq('parent_id', parentId)
      } else {
        // Load bookings for current user
        query = query.or(`parent_id.eq.${user.id},tutor_id.eq.${user.id}`)
      }

      const { data, error } = await query.order('scheduled_date', { ascending: true })

      if (error) throw error
      setBookings(data || [])
    } catch (err) {
      setError('Failed to load bookings')
      console.error('Error loading bookings:', err)
    }
  }

  const createBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const bookingData = {
        ...formData,
        parent_id: user.id,
        status: 'pending',
        parent_confirmed: true, // Parent confirms by creating
        tutor_confirmed: false
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()

      if (error) throw error

      // Create notification for tutor
      await supabase
        .from('notifications')
        .insert({
          user_id: formData.tutor_id,
          notification_type: 'booking_request',
          title: 'New Booking Request',
          message: `You have a new booking request for ${formData.subject}`,
          action_url: `/dashboard/bookings/${data.id}`,
          related_entity_id: data.id,
          related_entity_type: 'booking'
        })

      // Reset form and reload bookings
      setFormData({
        tutor_id: tutorId || '',
        child_id: '',
        subject: '',
        session_type: 'regular',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 60,
        session_format: 'online',
        location: '',
        special_requirements: '',
        session_fee: 0
      })
      setShowCreateForm(false)
      await loadBookings()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string, isParent: boolean = true) => {
    try {
      const updates = { status }
      
      if (status === 'confirmed') {
        if (isParent) {
          Object.assign(updates, { parent_confirmed: true })
        } else {
          Object.assign(updates, { tutor_confirmed: true })
        }
      }

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)

      if (error) throw error

      // Create notification for the other party
      const booking = bookings.find(b => b.id === bookingId)
      if (booking) {
        const recipientId = isParent ? booking.tutor_id : booking.parent_id
        const senderType = isParent ? 'parent' : 'tutor'
        
        await supabase
          .from('notifications')
          .insert({
            user_id: recipientId,
            notification_type: `booking_${status}`,
            title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your booking for ${booking.subject} has been ${status} by the ${senderType}`,
            action_url: `/dashboard/bookings/${bookingId}`,
            related_entity_id: bookingId,
            related_entity_type: 'booking'
          })
      }

      await loadBookings()
    } catch {
      setError('Failed to update booking status')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Book a Session' : 'Booking Management'}
          </h2>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Schedule your tutoring sessions' 
              : 'Manage your upcoming and past bookings'
            }
          </p>
        </div>
        
        {mode === 'manage' && children.length > 0 && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            New Booking
          </button>
        )}
      </div>

      {/* Create Booking Form */}
      {(mode === 'create' || showCreateForm) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Booking</h3>
          
          {children.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You need to add your children first before booking sessions.</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Add Child
              </button>
            </div>
          ) : (
            <form onSubmit={createBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Child Selection */}
                <div>
                  <label htmlFor="child-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Child *
                  </label>
                  <select
                    id="child-select"
                    value={formData.child_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, child_id: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a child</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.name} {child.age && `(Age ${child.age})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tutor Selection */}
                <div>
                  <label htmlFor="tutor-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Tutor *
                  </label>
                  <select
                    id="tutor-select"
                    value={formData.tutor_id}
                    onChange={(e) => {
                      const selectedTutor = tutors.find(t => t.profile_id === e.target.value)
                      setFormData(prev => ({ 
                        ...prev, 
                        tutor_id: e.target.value,
                        session_fee: selectedTutor?.hourly_rate || 0
                      }))
                    }}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a tutor</option>
                    {tutors.map(tutor => (
                      <option key={tutor.profile_id} value={tutor.profile_id}>
                        {tutor.name} - {tutor.subjects.join(', ')} 
                        {tutor.hourly_rate && ` (£${tutor.hourly_rate}/hr)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    placeholder="e.g., Mathematics, English, Science"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Session Type */}
                <div>
                  <label htmlFor="session-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Session Type
                  </label>
                  <select
                    id="session-type"
                    value={formData.session_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, session_type: e.target.value as 'regular' | 'trial' | 'assessment' | 'makeup' }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="regular">Regular Session</option>
                    <option value="trial">Trial Session</option>
                    <option value="assessment">Assessment</option>
                    <option value="makeup">Makeup Session</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    id="date-input"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Time */}
                <div>
                  <label htmlFor="time-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    id="time-input"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="duration-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <select
                    id="duration-select"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                {/* Session Format */}
                <div>
                  <label htmlFor="format-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Session Format
                  </label>
                  <select
                    id="format-select"
                    value={formData.session_format}
                    onChange={(e) => setFormData(prev => ({ ...prev, session_format: e.target.value as 'online' | 'in-person' | 'hybrid' }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="online">Online</option>
                    <option value="in-person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Location (if in-person) */}
              {formData.session_format === 'in-person' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                    placeholder="Enter the session location"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Special Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requirements
                </label>
                <textarea
                  value={formData.special_requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, special_requirements: e.target.value }))}
                  rows={3}
                  placeholder="Any special requirements or notes for this session..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Session Fee Display */}
              {formData.session_fee > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-blue-800">
                    <strong>Session Fee:</strong> £{formData.session_fee} for {formData.duration_minutes} minutes
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Booking'}
                </button>
                
                {showCreateForm && (
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* Bookings List */}
      {mode !== 'create' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bookings found</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{booking.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Child: {booking.child?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Tutor: {booking.tutor?.name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.scheduled_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{booking.scheduled_time} ({booking.duration_minutes} min)</span>
                      </div>
                      {booking.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.location}</span>
                        </div>
                      )}
                      {booking.session_fee && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">£{booking.session_fee}</span>
                        </div>
                      )}
                    </div>

                    {booking.booking_reference && (
                      <p className="text-xs text-gray-500 mt-2">
                        Booking Reference: {booking.booking_reference}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(booking.status)}
                  </div>
                </div>

                {/* Action Buttons */}
                {booking.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                    >
                      Mark Completed
                    </button>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors flex items-center gap-1"
                    >
                      <Star className="w-4 h-4" />
                      Leave Review
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
