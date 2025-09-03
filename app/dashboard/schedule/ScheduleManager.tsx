'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  User as UserIcon,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail
} from 'lucide-react'

interface TutorProfile {
  id: string
  name: string
  email: string
  subjects: string[]
  hourly_rate: number
}

interface TeacherStudent {
  id: string
  subject: string
  start_date: string
  hourly_rate: number
  children: {
    id: string
    name: string
    school_year: string | null
    profiles: {
      id: string
      full_name: string | null
      email: string
      phone: string | null
    }
  }
}

interface Session {
  id: string
  teacher_student_id: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  topic: string | null
  session_notes: string | null
  homework_assigned: string | null
  status: string
  rating: number | null
  teacher_students: {
    id: string
    subject: string
    children: {
      id: string
      name: string
    }
  }
}

interface Profile {
  id: string
  email: string
  full_name?: string
  user_type?: string
}

export default function ScheduleManager({ 
  tutorProfile,
  teacherStudents,
  upcomingSessions,
  pastSessions
}: {
  user: User
  profile: Profile | null
  tutorProfile: TutorProfile
  teacherStudents: TeacherStudent[]
  upcomingSessions: Session[]
  pastSessions: Session[]
}) {
  const [sessions, setSessions] = useState<Session[]>(upcomingSessions)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state for creating/editing sessions
  const [formData, setFormData] = useState({
    teacher_student_id: '',
    date: '',
    start_time: '',
    end_time: '',
    topic: '',
    session_notes: '',
    homework_assigned: '',
  })

  const resetForm = () => {
    setFormData({
      teacher_student_id: '',
      date: '',
      start_time: '',
      end_time: '',
      topic: '',
      session_notes: '',
      homework_assigned: '',
    })
    setSelectedSession(null)
  }

  const openEditDialog = (session: Session) => {
    setSelectedSession(session)
    setFormData({
      teacher_student_id: session.teacher_student_id,
      date: session.date,
      start_time: session.start_time,
      end_time: session.end_time,
      topic: session.topic || '',
      session_notes: session.session_notes || '',
      homework_assigned: session.homework_assigned || '',
    })
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const duration = calculateDuration(formData.start_time, formData.end_time)

      const sessionData = {
        teacher_student_id: formData.teacher_student_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        duration_minutes: duration,
        topic: formData.topic || null,
        session_notes: formData.session_notes || null,
        homework_assigned: formData.homework_assigned || null,
        status: 'scheduled',
        updated_at: new Date().toISOString(),
      }

      if (selectedSession) {
        // Update existing session
        const { data, error } = await supabase
          .from('sessions')
          .update(sessionData)
          .eq('id', selectedSession.id)
          .select(`
            *,
            teacher_students:teacher_student_id (
              id,
              subject,
              children:student_id (
                id,
                name
              )
            )
          `)
          .single()

        if (error) throw error

        setSessions(prev => prev.map(session => 
          session.id === selectedSession.id ? { ...session, ...data } : session
        ))

        toast({
          title: "Session updated successfully",
          description: `Session with ${data.teacher_students.children.name} has been updated.`,
        })
      } else {
        // Create new session
        const { data, error } = await supabase
          .from('sessions')
          .insert([{ ...sessionData, created_at: new Date().toISOString() }])
          .select(`
            *,
            teacher_students:teacher_student_id (
              id,
              subject,
              children:student_id (
                id,
                name
              )
            )
          `)
          .single()

        if (error) throw error

        setSessions(prev => [data, ...prev].sort((a, b) => {
          const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
          if (dateCompare === 0) {
            return a.start_time.localeCompare(b.start_time)
          }
          return dateCompare
        }))

        toast({
          title: "Session scheduled successfully",
          description: `Session with ${data.teacher_students.children.name} has been scheduled.`,
        })
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving session:', error)
      toast({
        title: "Error",
        description: "Failed to save session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (sessionId: string, newStatus: string) => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('sessions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) throw error

      setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, status: newStatus } : session
      ))

      toast({
        title: "Session status updated",
        description: `Session marked as ${newStatus}.`,
      })
    } catch (error) {
      console.error('Error updating session status:', error)
      toast({
        title: "Error",
        description: "Failed to update session status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (sessionId: string) => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error

      setSessions(prev => prev.filter(session => session.id !== sessionId))

      toast({
        title: "Session deleted",
        description: "Session has been removed from your schedule.",
      })
    } catch (error) {
      console.error('Error deleting session:', error)
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'scheduled': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200'
      case 'no_show': return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />
      case 'scheduled': return <Clock className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      case 'no_show': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-[#8A2BE1]" />
              <div>
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-[#8A2BE1]">{teacherStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-blue-600">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{pastSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-orange-600">{tutorProfile.subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="history">Session History</TabsTrigger>
          </TabsList>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="bg-[#8A2BE1] hover:bg-[#7B27D1]">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedSession ? 'Edit Session' : 'Schedule New Session'}
                </DialogTitle>
                <DialogDescription>
                  {selectedSession 
                    ? 'Update session details'
                    : 'Create a new tutoring session'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student">Student *</Label>
                    <Select 
                      value={formData.teacher_student_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, teacher_student_id: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherStudents.map(ts => (
                          <SelectItem key={ts.id} value={ts.id}>
                            {ts.children.name} - {ts.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="start_time">Start Time *</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_time">End Time *</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="topic">Session Topic</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Quadratic Equations, Essay Writing"
                  />
                </div>

                <div>
                  <Label htmlFor="session_notes">Session Notes</Label>
                  <Textarea
                    id="session_notes"
                    value={formData.session_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, session_notes: e.target.value }))}
                    placeholder="Preparation notes, objectives, materials needed..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="homework_assigned">Homework Assignment</Label>
                  <Textarea
                    id="homework_assigned"
                    value={formData.homework_assigned}
                    onChange={(e) => setFormData(prev => ({ ...prev, homework_assigned: e.target.value }))}
                    placeholder="Homework tasks and requirements..."
                    rows={2}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : selectedSession ? 'Update Session' : 'Schedule Session'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Upcoming Sessions Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
                <p className="text-gray-500 mb-4">Schedule your first tutoring session to get started</p>
                <Button onClick={openAddDialog} className="bg-[#8A2BE1] hover:bg-[#7B27D1]">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="border-l-4 border-l-[#8A2BE2]">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="font-medium text-lg">{session.teacher_students.children.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(session.status)}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(session.status)}
                              {session.status}
                            </div>
                          </span>
                          <span className="text-sm text-gray-500">{session.teacher_students.subject}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(session.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(session.start_time)} - {formatTime(session.end_time)} ({session.duration_minutes} min)
                          </div>
                        </div>

                        {session.topic && (
                          <div className="text-sm">
                            <span className="font-medium">Topic: </span>
                            {session.topic}
                          </div>
                        )}

                        {session.session_notes && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <span className="font-medium">Notes: </span>
                            {session.session_notes}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {session.status === 'scheduled' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(session.id, 'completed')}
                              disabled={isLoading}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(session)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(session.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherStudents.map((ts) => (
              <Card key={ts.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-[#8A2BE1]" />
                    {ts.children.name}
                  </CardTitle>
                  <CardDescription>
                    {ts.subject} • {ts.children.school_year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">Rate: </span>
                    £{ts.hourly_rate}/hour
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Started: </span>
                    {formatDate(ts.start_date)}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Parent Contact:</div>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-3 w-3" />
                        {ts.children.profiles.full_name || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {ts.children.profiles.email}
                      </div>
                      {ts.children.profiles.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {ts.children.profiles.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, teacher_student_id: ts.id }))
                      openAddDialog()
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {pastSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No session history</h3>
                <p className="text-gray-500">Completed sessions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="font-medium">{session.teacher_students.children.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(session.status)}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(session.status)}
                              {session.status}
                            </div>
                          </span>
                          <span className="text-sm text-gray-500">{session.teacher_students.subject}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(session.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(session.start_time)} - {formatTime(session.end_time)}
                          </div>
                        </div>

                        {session.topic && (
                          <div className="text-sm">
                            <span className="font-medium">Topic: </span>
                            {session.topic}
                          </div>
                        )}
                      </div>

                      {session.rating && (
                        <div className="text-sm">
                          <span className="font-medium">Rating: </span>
                          {session.rating}/5 ⭐
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
