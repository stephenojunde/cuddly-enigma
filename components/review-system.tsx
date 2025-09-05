"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/client'
import { Star, CheckCircle, Clock, Eye } from 'lucide-react'

const supabase = createClient()

interface Booking {
  id: string
  tutor_id: string
  child_id: string
  subject: string
  scheduled_date: string
  tutor?: {
    name: string
    profile_id: string
  }
  child?: {
    name: string
  }
}

interface Review {
  id: string
  booking_id: string
  tutor_id: string
  reviewer_id: string
  child_id: string
  overall_rating: number
  teaching_quality?: number
  communication?: number
  punctuality?: number
  preparation?: number
  review_title?: string
  review_content?: string
  what_went_well?: string
  areas_for_improvement?: string
  would_recommend?: boolean
  is_approved: boolean
  is_featured: boolean
  created_at: string
  tutor?: {
    name: string
    profile_id: string
  }
  child?: {
    name: string
  }
}

interface ReviewSystemProps {
  mode?: 'create' | 'manage' | 'view'
  tutorId?: string
  bookingId?: string
}

export default function ReviewSystem({ mode = 'manage', tutorId, bookingId }: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    overall_rating: 5,
    teaching_quality: 5,
    communication: 5,
    punctuality: 5,
    preparation: 5,
    review_title: '',
    review_content: '',
    what_went_well: '',
    areas_for_improvement: '',
    would_recommend: true
  })

  const loadCompletedBookings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('bookings')
        .select(`
          id,
          tutor_id,
          child_id,
          subject,
          scheduled_date,
          tutor:profiles!tutor_id(name, profile_id),
          child:children(name)
        `)
        .eq('status', 'completed')
        .eq('parent_id', user.id)

      if (bookingId) {
        query = query.eq('id', bookingId)
      }

      const { data, error } = await query
        .order('scheduled_date', { ascending: false })

      if (error) throw error

      // Filter out bookings that already have reviews and fix the data structure
      const bookingsWithoutReviews: Booking[] = []
      for (const booking of data || []) {
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('booking_id', booking.id)
          .single()

        if (!existingReview) {
          // Fix the data structure: tutor and child come as arrays but we need single objects
          const processedBooking: Booking = {
            ...booking,
            tutor: Array.isArray(booking.tutor) ? booking.tutor[0] : booking.tutor,
            child: Array.isArray(booking.child) ? booking.child[0] : booking.child
          }
          bookingsWithoutReviews.push(processedBooking)
        }
      }

      setCompletedBookings(bookingsWithoutReviews)
    } catch (err) {
      console.error('Error loading completed bookings:', err)
    }
  }, [bookingId])

  const loadReviews = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('reviews')
        .select(`
          *,
          tutor:profiles!tutor_id(name, profile_id),
          child:children(name)
        `)

      if (mode === 'view' && tutorId) {
        // Public view of tutor reviews
        query = query.eq('tutor_id', tutorId).eq('is_approved', true)
      } else {
        // User's own reviews
        query = query.eq('reviewer_id', user.id)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (err) {
      console.error('Error loading reviews:', err)
    }
  }, [mode, tutorId])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please log in to access reviews')
        return
      }

      if (mode === 'create' || mode === 'manage') {
        await loadCompletedBookings()
      }
      
      await loadReviews()
    } catch (err) {
      setError('Failed to load review data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }, [mode, loadCompletedBookings, loadReviews])

  useEffect(() => {
    loadData()
  }, [loadData])

  const resetForm = () => {
    setFormData({
      overall_rating: 5,
      teaching_quality: 5,
      communication: 5,
      punctuality: 5,
      preparation: 5,
      review_title: '',
      review_content: '',
      what_went_well: '',
      areas_for_improvement: '',
      would_recommend: true
    })
    setSelectedBooking(null)
    setShowCreateForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const reviewData = {
        ...formData,
        booking_id: selectedBooking.id,
        tutor_id: selectedBooking.tutor_id,
        reviewer_id: user.id,
        child_id: selectedBooking.child_id,
        is_approved: false // Reviews require approval
      }

      const { error } = await supabase
        .from('reviews')
        .insert(reviewData)

      if (error) throw error

      // Create notification for tutor
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedBooking.tutor_id,
          notification_type: 'review_received',
          title: 'New Review Received',
          message: `You received a new review for your ${selectedBooking.subject} session`,
          action_url: `/dashboard/reviews`,
          related_entity_id: selectedBooking.id,
          related_entity_type: 'review'
        })

      resetForm()
      await loadData()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  const renderStarRating = (rating: number, onChange?: (rating: number) => void, disabled = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange && !disabled && onChange(star)}
            disabled={disabled}
            title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            className={`${disabled ? 'cursor-default' : 'cursor-pointer'} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
      </div>
    )
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
            {mode === 'view' ? 'Tutor Reviews' : 'Review Management'}
          </h2>
          <p className="text-gray-600">
            {mode === 'view' 
              ? 'See what parents are saying' 
              : 'Leave reviews for your completed sessions'
            }
          </p>
        </div>
        
        {mode !== 'view' && completedBookings.length > 0 && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Create Review Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          
          {/* Booking Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Session to Review *
            </label>
            <div className="space-y-2">
              {completedBookings.map((booking) => (
                <label key={booking.id} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50">
                  <input
                    type="radio"
                    name="booking"
                    value={booking.id}
                    checked={selectedBooking?.id === booking.id}
                    onChange={() => setSelectedBooking(booking)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{booking.subject} with {booking.tutor?.name}</p>
                    <p className="text-sm text-gray-600">
                      {booking.child?.name} • {new Date(booking.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedBooking && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Rating *
                  </label>
                  {renderStarRating(formData.overall_rating, (rating) => 
                    setFormData(prev => ({ ...prev, overall_rating: rating }))
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teaching Quality
                  </label>
                  {renderStarRating(formData.teaching_quality, (rating) => 
                    setFormData(prev => ({ ...prev, teaching_quality: rating }))
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication
                  </label>
                  {renderStarRating(formData.communication, (rating) => 
                    setFormData(prev => ({ ...prev, communication: rating }))
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Punctuality
                  </label>
                  {renderStarRating(formData.punctuality, (rating) => 
                    setFormData(prev => ({ ...prev, punctuality: rating }))
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preparation
                  </label>
                  {renderStarRating(formData.preparation, (rating) => 
                    setFormData(prev => ({ ...prev, preparation: rating }))
                  )}
                </div>
              </div>

              {/* Written Review */}
              <div>
                <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Review Title
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={formData.review_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, review_title: e.target.value }))}
                  placeholder="e.g., Excellent maths tutor!"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  id="review-content"
                  value={formData.review_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, review_content: e.target.value }))}
                  rows={4}
                  placeholder="Tell other parents about your experience..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="what-went-well" className="block text-sm font-medium text-gray-700 mb-1">
                  What went well?
                </label>
                <textarea
                  id="what-went-well"
                  value={formData.what_went_well}
                  onChange={(e) => setFormData(prev => ({ ...prev, what_went_well: e.target.value }))}
                  rows={3}
                  placeholder="What did the tutor do particularly well?"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="areas-for-improvement" className="block text-sm font-medium text-gray-700 mb-1">
                  Areas for Improvement (Optional)
                </label>
                <textarea
                  id="areas-for-improvement"
                  value={formData.areas_for_improvement}
                  onChange={(e) => setFormData(prev => ({ ...prev, areas_for_improvement: e.target.value }))}
                  rows={3}
                  placeholder="Any constructive feedback?"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Recommendation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Would you recommend this tutor?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.would_recommend === true}
                      onChange={() => setFormData(prev => ({ ...prev, would_recommend: true }))}
                      className="w-4 h-4 text-blue-600 mr-2"
                    />
                    Yes, I would recommend
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.would_recommend === false}
                      onChange={() => setFormData(prev => ({ ...prev, would_recommend: false }))}
                      className="w-4 h-4 text-blue-600 mr-2"
                    />
                    No, I would not recommend
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reviews yet</p>
            {mode !== 'view' && completedBookings.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                You have {completedBookings.length} completed session{completedBookings.length !== 1 ? 's' : ''} ready for review
              </p>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {review.review_title && (
                      <h3 className="text-lg font-semibold">{review.review_title}</h3>
                    )}
                    <div className="flex items-center gap-1">
                      {renderStarRating(review.overall_rating, undefined, true)}
                      <span className="text-sm text-gray-600 ml-1">
                        ({review.overall_rating}/5)
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <span>For {review.child?.name}</span>
                    {mode === 'manage' && review.tutor && (
                      <span> • Tutor: {review.tutor.name}</span>
                    )}
                    <span> • {new Date(review.created_at).toLocaleDateString()}</span>
                  </div>

                  {review.review_content && (
                    <p className="text-gray-700 mb-3">{review.review_content}</p>
                  )}

                  {/* Detailed Ratings */}
                  {(review.teaching_quality || review.communication || review.punctuality || review.preparation) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      {review.teaching_quality && (
                        <div>
                          <p className="text-gray-600">Teaching Quality</p>
                          {renderStarRating(review.teaching_quality, undefined, true)}
                        </div>
                      )}
                      {review.communication && (
                        <div>
                          <p className="text-gray-600">Communication</p>
                          {renderStarRating(review.communication, undefined, true)}
                        </div>
                      )}
                      {review.punctuality && (
                        <div>
                          <p className="text-gray-600">Punctuality</p>
                          {renderStarRating(review.punctuality, undefined, true)}
                        </div>
                      )}
                      {review.preparation && (
                        <div>
                          <p className="text-gray-600">Preparation</p>
                          {renderStarRating(review.preparation, undefined, true)}
                        </div>
                      )}
                    </div>
                  )}

                  {review.what_went_well && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">What went well:</p>
                      <p className="text-sm text-gray-600">{review.what_went_well}</p>
                    </div>
                  )}

                  {review.areas_for_improvement && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Areas for improvement:</p>
                      <p className="text-sm text-gray-600">{review.areas_for_improvement}</p>
                    </div>
                  )}

                  {review.would_recommend !== null && (
                    <div className="flex items-center gap-1 text-sm">
                      {review.would_recommend ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-red-500" />
                      )}
                      <span className={review.would_recommend ? 'text-green-700' : 'text-red-700'}>
                        {review.would_recommend ? 'Recommends this tutor' : 'Does not recommend this tutor'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {review.is_approved ? (
                    <div className="flex items-center gap-1 text-green-600" title="Review approved">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">Published</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-600" title="Awaiting approval">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Pending</span>
                    </div>
                  )}
                  
                  {review.is_featured && (
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      Featured
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completed Bookings Available for Review */}
      {mode === 'manage' && completedBookings.length > 0 && !showCreateForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Sessions Ready for Review ({completedBookings.length})
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            You have completed sessions that you can review to help other parents.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Write Review
          </button>
        </div>
      )}
    </div>
  )
}
