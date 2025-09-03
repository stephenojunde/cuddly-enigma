'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { User, Calendar, BookOpen, Star, Plus, MessageSquare, Phone, Mail } from 'lucide-react'

interface Booking {
  id: string
  student_name: string
  subject: string
  session_date: string
  status: string
  notes?: string
  parent_id: string
  profiles: {
    full_name: string
    email: string
    phone?: string
  }
}

interface ProgressReport {
  id: string
  child_id: string
  subject: string
  session_date: string
  progress_score: number
  strengths: string
  areas_for_improvement: string
  homework_assigned: string
  children?: {
    name: string
    age: number
    grade: string
  }
}

interface StudentManagerProps {
  tutorId: string
  bookings: Booking[]
  progressReports: ProgressReport[]
  currentUserId: string
}

export function StudentManager({ tutorId, bookings, progressReports: initialProgressReports }: StudentManagerProps) {
  const [progressReports, setProgressReports] = useState(initialProgressReports)
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [isAddingReport, setIsAddingReport] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const [newReport, setNewReport] = useState({
    student_name: '',
    subject: '',
    session_date: '',
    progress_score: 5,
    strengths: '',
    areas_for_improvement: '',
    homework_assigned: ''
  })

  // Group bookings by student
  const studentGroups = bookings.reduce((acc, booking) => {
    const key = `${booking.student_name}-${booking.parent_id}`
    if (!acc[key]) {
      acc[key] = {
        student_name: booking.student_name,
        parent_info: booking.profiles,
        parent_id: booking.parent_id,
        bookings: [],
        subjects: new Set(),
        totalSessions: 0,
        completedSessions: 0
      }
    }
    acc[key].bookings.push(booking)
    acc[key].subjects.add(booking.subject)
    acc[key].totalSessions++
    if (booking.status === 'completed') {
      acc[key].completedSessions++
    }
    return acc
  }, {} as Record<string, any>)

  const students = Object.values(studentGroups).map((group: any) => ({
    ...group,
    subjects: Array.from(group.subjects),
    recentSession: group.bookings.sort((a: Booking, b: Booking) => 
      new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
    )[0]
  }))

  const addProgressReport = async () => {
    if (!newReport.student_name || !newReport.subject || !newReport.session_date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('progress_reports')
        .insert([{
          tutor_id: tutorId,
          subject: newReport.subject,
          session_date: newReport.session_date,
          progress_score: newReport.progress_score,
          strengths: newReport.strengths,
          areas_for_improvement: newReport.areas_for_improvement,
          homework_assigned: newReport.homework_assigned
        }])
        .select()
        .single()

      if (error) throw error

      setProgressReports([data, ...progressReports])
      setNewReport({
        student_name: '',
        subject: '',
        session_date: '',
        progress_score: 5,
        strengths: '',
        areas_for_improvement: '',
        homework_assigned: ''
      })
      setIsAddingReport(false)
      
      toast({
        title: "Progress report added",
        description: "The progress report has been saved.",
      })
    } catch (error: any) {
      toast({
        title: "Error adding progress report",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getProgressColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressBadge = (score: number) => {
    if (score >= 8) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 6) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">My Students</TabsTrigger>
          <TabsTrigger value="progress">Progress Reports</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student, index) => (
              <Card key={`${student.student_name}-${student.parent_id}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{student.student_name}</CardTitle>
                      <CardDescription>
                        Parent: {student.parent_info.full_name}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {student.completedSessions}/{student.totalSessions} sessions
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Subjects</h4>
                    <div className="flex flex-wrap gap-1">
                      {student.subjects.map((subject: string) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{student.parent_info.email}</span>
                      </div>
                      {student.parent_info.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{student.parent_info.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {student.recentSession && (
                    <div>
                      <h4 className="font-medium mb-2">Last Session</h4>
                      <p className="text-sm text-gray-600">
                        {student.recentSession.subject} • {' '}
                        {new Date(student.recentSession.session_date).toLocaleDateString()}
                      </p>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {student.recentSession.status}
                      </Badge>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {students.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No students yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Students will appear here after you have confirmed bookings.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Progress Reports</CardTitle>
                  <CardDescription>Track and document student progress</CardDescription>
                </div>
                <Button onClick={() => setIsAddingReport(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Report
                </Button>
              </div>
            </CardHeader>
            {isAddingReport && (
              <CardContent className="border-t">
                <div className="space-y-4">
                  <h3 className="font-medium">Add Progress Report</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Student Name</Label>
                      <Select value={newReport.student_name} onValueChange={(value) => setNewReport({...newReport, student_name: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.student_name} value={student.student_name}>
                              {student.student_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Subject</Label>
                      <Input
                        value={newReport.subject}
                        onChange={(e) => setNewReport({...newReport, subject: e.target.value})}
                        placeholder="Subject"
                      />
                    </div>
                    <div>
                      <Label>Session Date</Label>
                      <Input
                        type="date"
                        value={newReport.session_date}
                        onChange={(e) => setNewReport({...newReport, session_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Progress Score (1-10)</Label>
                      <Select value={newReport.progress_score.toString()} onValueChange={(value) => setNewReport({...newReport, progress_score: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10].map(score => (
                            <SelectItem key={score} value={score.toString()}>{score}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Strengths</Label>
                    <Textarea
                      value={newReport.strengths}
                      onChange={(e) => setNewReport({...newReport, strengths: e.target.value})}
                      placeholder="What did the student do well?"
                    />
                  </div>
                  <div>
                    <Label>Areas for Improvement</Label>
                    <Textarea
                      value={newReport.areas_for_improvement}
                      onChange={(e) => setNewReport({...newReport, areas_for_improvement: e.target.value})}
                      placeholder="What areas need more work?"
                    />
                  </div>
                  <div>
                    <Label>Homework Assigned</Label>
                    <Textarea
                      value={newReport.homework_assigned}
                      onChange={(e) => setNewReport({...newReport, homework_assigned: e.target.value})}
                      placeholder="Any homework or practice assignments"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addProgressReport}>Save Report</Button>
                    <Button variant="outline" onClick={() => setIsAddingReport(false)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <div className="space-y-4">
            {progressReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.subject}</CardTitle>
                      <CardDescription>
                        {report.children?.name || 'Student'} • {new Date(report.session_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getProgressColor(report.progress_score)}`}>
                        {report.progress_score}/10
                      </div>
                      {getProgressBadge(report.progress_score)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.strengths && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                      <p className="text-sm text-gray-600">{report.strengths}</p>
                    </div>
                  )}
                  
                  {report.areas_for_improvement && (
                    <div>
                      <h4 className="font-medium text-orange-700 mb-2">Areas for Improvement</h4>
                      <p className="text-sm text-gray-600">{report.areas_for_improvement}</p>
                    </div>
                  )}
                  
                  {report.homework_assigned && (
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">Homework Assigned</h4>
                      <p className="text-sm text-gray-600">{report.homework_assigned}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {progressReports.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No progress reports yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add progress reports to track student development.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="space-y-4">
            {bookings.slice(0, 20).map((booking) => (
              <Card key={booking.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{booking.subject}</h3>
                      <p className="text-sm text-gray-600">
                        Student: {booking.student_name} • Parent: {booking.profiles.full_name}
                      </p>
                      {booking.notes && (
                        <p className="text-sm text-gray-500">Notes: {booking.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(booking.session_date).toLocaleDateString()}
                      </p>
                      <Badge variant="outline" className="capitalize">
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {bookings.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No sessions found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}