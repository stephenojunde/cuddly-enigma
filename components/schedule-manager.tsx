'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Clock, User, Phone, Mail, Plus, Edit, Trash2 } from 'lucide-react'

interface Schedule {
  id: string
  tutor_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

interface Booking {
  id: string
  student_name: string
  subject: string
  session_date: string
  duration_minutes: number
  status: string
  notes?: string
  profiles: {
    full_name: string
    email: string
    phone?: string
  }
}

interface ScheduleManagerProps {
  tutorId: string
  schedules: Schedule[]
  bookings: Booking[]
  currentUserId: string
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

export function ScheduleManager({ tutorId, schedules: initialSchedules, bookings }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState(initialSchedules)
  const [isAddingSchedule, setIsAddingSchedule] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const [newSchedule, setNewSchedule] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    is_available: true
  })

  const addSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_schedules')
        .insert([{
          tutor_id: tutorId,
          ...newSchedule
        }])
        .select()
        .single()

      if (error) throw error

      setSchedules([...schedules, data])
      setNewSchedule({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      })
      setIsAddingSchedule(false)
      
      toast({
        title: "Schedule added",
        description: "Your availability has been updated.",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: "Error adding schedule",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const updateSchedule = async (scheduleId: string, updates: Partial<Schedule>) => {
    try {
      const { error } = await supabase
        .from('teacher_schedules')
        .update(updates)
        .eq('id', scheduleId)

      if (error) throw error

      setSchedules(schedules.map(schedule => 
        schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
      ))
      
      toast({
        title: "Schedule updated",
        description: "Your availability has been updated.",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: "Error updating schedule",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('teacher_schedules')
        .delete()
        .eq('id', scheduleId)

      if (error) throw error

      setSchedules(schedules.filter(schedule => schedule.id !== scheduleId))
      
      toast({
        title: "Schedule deleted",
        description: "The schedule slot has been removed.",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: "Error deleting schedule",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const toggleAvailability = (scheduleId: string, isAvailable: boolean) => {
    updateSchedule(scheduleId, { is_available: isAvailable })
  }

  // Group schedules by day
  const schedulesByDay = DAYS_OF_WEEK.map((day, index) => ({
    day,
    dayIndex: index,
    schedules: schedules.filter(s => s.day_of_week === index)
  }))

  // Group bookings by date
  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.session_date) >= new Date()
  )

  const todayBookings = upcomingBookings.filter(booking => {
    const bookingDate = new Date(booking.session_date)
    const today = new Date()
    return bookingDate.toDateString() === today.toDateString()
  })

  return (
    <div className="space-y-6">
      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Sessions
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayBookings.length > 0 ? (
            <div className="space-y-4">
              {todayBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">{booking.subject}</h3>
                    <p className="text-sm text-gray-600">
                      Student: {booking.student_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Parent: {booking.profiles.full_name}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">
                      {new Date(booking.session_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{booking.duration_minutes} min</p>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'outline'}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sessions scheduled for today</p>
          )}
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Weekly Availability</CardTitle>
              <CardDescription>Set your available hours for each day</CardDescription>
            </div>
            <Button onClick={() => setIsAddingSchedule(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {schedulesByDay.map(({ day, schedules: daySchedules }) => (
              <div key={day} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-3">{day}</h3>
                {daySchedules.length > 0 ? (
                  <div className="space-y-2">
                    {daySchedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {schedule.start_time} - {schedule.end_time}
                          </span>
                          <Switch
                            checked={schedule.is_available}
                            onCheckedChange={(checked) => toggleAvailability(schedule.id, checked)}
                          />
                          <span className="text-sm text-gray-600">
                            {schedule.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSchedule(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteSchedule(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No availability set for this day</p>
                )}
              </div>
            ))}
          </div>

          {/* Add Schedule Form */}
          {isAddingSchedule && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-4">Add New Time Slot</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Day</Label>
                  <select
                    value={newSchedule.day_of_week}
                    onChange={(e) => setNewSchedule({...newSchedule, day_of_week: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded-md"
                  >
                    {DAYS_OF_WEEK.map((day, index) => (
                      <option key={day} value={index}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={newSchedule.start_time}
                    onChange={(e) => setNewSchedule({...newSchedule, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={newSchedule.end_time}
                    onChange={(e) => setNewSchedule({...newSchedule, end_time: e.target.value})}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={addSchedule}>Add</Button>
                  <Button variant="outline" onClick={() => setIsAddingSchedule(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Your confirmed tutoring sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.slice(0, 10).map((booking) => (
                <div key={booking.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <h3 className="font-medium">{booking.subject}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Student: {booking.student_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Parent: {booking.profiles.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{booking.profiles.email}</span>
                      </div>
                      {booking.profiles.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{booking.profiles.phone}</span>
                        </div>
                      )}
                    </div>
                    {booking.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-medium">
                      {new Date(booking.session_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.session_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{booking.duration_minutes} minutes</p>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'outline'}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming sessions</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Default export for compatibility
export default ScheduleManager