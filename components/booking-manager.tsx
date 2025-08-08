'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Clock, User, MapPin, Plus, Edit, Trash2 } from 'lucide-react'
import { safeString, safeNumber, safeDate } from '@/lib/utils'

interface Booking {
  id: string
  parent_id: string
  tutor_id: string
  student_name: string
  subject: string
  session_date: string
  duration_minutes: number
  status: string
  notes?: string
  tutors?: {
    name: string
    subjects: string[]
    hourly_rate: number
    phone?: string
    email?: string
  }
  profiles?: {
    full_name: string
    email: string
    phone?: string
  }
}

interface Tutor {
  id: string
  name: string
  subjects: string[]
  hourly_rate: number
  location: string
}

interface BookingManagerProps {
  currentUserId: string
  userType: string
  bookings: Booking[]
  tutors: Tutor[]
}

export function BookingManager({ currentUserId, userType, bookings: initialBookings, tutors }: BookingManagerProps) {
  const [bookings, setBookings] = useState(initialBookings)
  const [isCreating, setIsCreating] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const [newBooking, setNewBooking] = useState({
    tutor_id: '',
    student_name: '',
    subject: '',
    session_date: '',
    session_time: '',
    duration_minutes: 60,
    notes: ''
  })

  async function createBooking() {
    if (!newBooking.tutor_id || !newBooking.student_name || !newBooking.subject || !newBooking.session_date || !newBooking.session_time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const sessionDateTime = new Date(`${newBooking.session_date}T${newBooking.session_time}`)

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            parent_id: currentUserId,
            tutor_id: newBooking.tutor_id,
            student_name: newBooking.student_name,
            subject: newBooking.subject,
            session_date: sessionDateTime.toISOString(),
            duration_minutes: newBooking.duration_minutes,
            notes: newBooking.notes || null,
            status: 'pending'
          }
        ])
        .select(`
          *,
          tutors (name, subjects, hourly_rate, phone, email)
        `)
        .single()

      if (error) throw error

      setBookings([data, ...bookings])
      setNewBooking({
        tutor_id: '', student_name: '', subject: '', session_date: '', 
        session_time: '', duration_minutes: 60, notes: ''
      })
      setIsCreating(false)
      
      toast({
        title: "Booking created!",
        description: "Your tutoring session has been requested.",
      })
    } catch (error: any) {
      toast({
        title: "Error creating booking",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)

      if (error) throw error

      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      ))
      
      toast({
        title: "Booking updated",
        description: `Booking status changed to ${status}`,
      })
    } catch (error: any) {
      toast({
        title: "Error updating booking",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  async function deleteBooking(bookingId: string) {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error

      setBookings(bookings.filter(booking => booking.id !== bookingId))
      
      toast({
        title: "Booking deleted",
        description: "The booking has been removed.",
      })
    } catch (error: any) {
      toast({
        title: "Error deleting booking",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default'
      case 'completed': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.session_date) > new Date()
  )
  
  const pastBookings = bookings.filter(booking => 
    new Date(booking.session_date) <= new Date()
  )

  return (
    <div className="space-y-6">
      {/* Create New Booking */}
      {userType === 'parent' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Book a Session</CardTitle>
              <Button onClick={() => setIsCreating(!isCreating)}>
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </div>
          </CardHeader>
          {isCreating && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Select Tutor *</Label>
                  <Select value={newBooking.tutor_id} onValueChange={(value) => setNewBooking({...newBooking, tutor_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutors.map(tutor => (
                        <SelectItem key={tutor.id} value={tutor.id}>
                          {safeString(tutor.name)} - £{safeNumber(tutor.hourly_rate)}/hr
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="student_name">Student Name *</Label>
                  <Input
                    id="student_name"
                    value={newBooking.student_name}
                    onChange={(e) => setNewBooking({...newBooking, student_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={newBooking.subject}
                    onChange={(e) => setNewBooking({...newBooking, subject: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={newBooking.duration_minutes.toString()} onValueChange={(value) => setNewBooking({...newBooking, duration_minutes: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="session_date">Date *</Label>
                  <Input
                    id="session_date"
                    type="date"
                    value={newBooking.session_date}
                    onChange={(e) => setNewBooking({...newBooking, session_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="session_time">Time *</Label>
                  <Input
                    id="session_time"
                    type="time"
                    value={newBooking.session_time}
                    onChange={(e) => setNewBooking({...newBooking, session_time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or notes for the tutor"
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={createBooking}>Create Booking</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Your scheduled tutoring sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => {
                const sessionDate = safeDate(booking.session_date)
                const tutorName = safeString(booking.tutors?.name, 'Tutor')
                const studentName = safeString(booking.student_name, 'Student')
                const subject = safeString(booking.subject, 'Subject')
                const parentName = safeString(booking.profiles?.full_name, 'Parent')

                return (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <h3 className="font-semibold text-lg">{subject}</h3>
                          <Badge variant={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {userType === 'parent' ? `Tutor: ${tutorName}` : `Student: ${studentName}`}
                          </div>
                          {userType === 'teacher' && (
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Parent: {parentName}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {sessionDate ? sessionDate.toLocaleDateString() : 'Date TBD'}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {sessionDate ? sessionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time TBD'} ({booking.duration_minutes} min)
                          </div>
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {userType === 'teacher' && booking.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => updateBookingStatus(booking.id, 'confirmed')}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
                              Decline
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button size="sm" variant="outline" onClick={() => updateBookingStatus(booking.id, 'completed')}>
                            Mark Complete
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => deleteBooking(booking.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming sessions</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Past Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Past Sessions</CardTitle>
          <CardDescription>Your completed and cancelled sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => {
                const sessionDate = safeDate(booking.session_date)
                const tutorName = safeString(booking.tutors?.name, 'Tutor')
                const studentName = safeString(booking.student_name, 'Student')
                const subject = safeString(booking.subject, 'Subject')

                return (
                  <div key={booking.id} className="border rounded-lg p-4 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <h3 className="font-semibold">{subject}</h3>
                          <Badge variant={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {userType === 'parent' ? `Tutor: ${tutorName}` : `Student: ${studentName}`}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {sessionDate ? sessionDate.toLocaleDateString() : 'Date TBD'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 text-center py-8">No past sessions</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
