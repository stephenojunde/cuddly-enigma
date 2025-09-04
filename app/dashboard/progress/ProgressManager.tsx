'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Award, 
  Clock, 
  User as UserIcon,
  BarChart3,
  CheckCircle2,
  GraduationCap
} from 'lucide-react'

interface Child {
  id: string
  name: string
  school_year: string | null
}

interface ProgressData {
  id: string
  student_id: string
  tutor_id: string
  subject: string
  current_grade: string | null
  target_grade: string | null
  progress_percentage: number
  assessment_date: string
  notes: string | null
  skills_improved: string[]
  areas_for_improvement: string[]
  homework_completion: number
  attendance_rate: number
  children: Child
  tutors: {
    id: string
    name: string
    email: string
  }
}

interface Session {
  id: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  topic: string | null
  session_notes: string | null
  rating: number | null
  teacher_students: {
    id: string
    subject: string
    children: Child
    tutors: {
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

interface ProgressManagerProps {
  user: User
  profile: Profile | null
  childrenList: Child[]
  progressData: ProgressData[]
  recentSessions: Session[]
}

export default function ProgressManager({ 
  childrenList, 
  progressData, 
  recentSessions 
}: ProgressManagerProps) {
  const [selectedChild, setSelectedChild] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  // Filter progress data based on selections
  const filteredProgress = progressData.filter(progress => {
    const childMatch = selectedChild === 'all' || progress.student_id === selectedChild
    const subjectMatch = selectedSubject === 'all' || progress.subject === selectedSubject
    return childMatch && subjectMatch
  })

  // Filter sessions based on selections
  const filteredSessions = recentSessions.filter(session => {
    const childMatch = selectedChild === 'all' || session.teacher_students.children.id === selectedChild
    const subjectMatch = selectedSubject === 'all' || session.teacher_students.subject === selectedSubject
    return childMatch && subjectMatch
  })

  // Get unique subjects from progress data
  const subjects = [...new Set(progressData.map(p => p.subject))]

  // Calculate overall statistics
  const getOverallStats = () => {
    if (filteredProgress.length === 0) return null

    const avgProgress = Math.round(
      filteredProgress.reduce((sum, p) => sum + p.progress_percentage, 0) / filteredProgress.length
    )
    
    const avgHomework = Math.round(
      filteredProgress.reduce((sum, p) => sum + p.homework_completion, 0) / filteredProgress.length
    )
    
    const avgAttendance = Math.round(
      filteredProgress.reduce((sum, p) => sum + p.attendance_rate, 0) / filteredProgress.length
    )

    const totalSessions = filteredSessions.length
    const avgRating = filteredSessions.length > 0 
      ? filteredSessions.filter(s => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) / filteredSessions.filter(s => s.rating).length
      : 0

    return {
      avgProgress,
      avgHomework,
      avgAttendance,
      totalSessions,
      avgRating: Math.round(avgRating * 10) / 10
    }
  }

  const stats = getOverallStats()

  const getGradeProgression = (current: string | null, target: string | null) => {
    if (!current || !target) return null
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{current}</span>
        <span className="text-gray-400">→</span>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{target}</span>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-gray-500" />
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select child" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Children</SelectItem>
              {childrenList.map(child => (
                <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-gray-500" />
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#8A2BE1]" />
                <div>
                  <p className="text-sm text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-[#8A2BE1]">{stats.avgProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Homework</p>
                  <p className="text-2xl font-bold text-green-600">{stats.avgHomework}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Attendance</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.avgAttendance}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Sessions</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.avgRating || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Progress Overview</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
        </TabsList>

        {/* Progress Overview Tab */}
        <TabsContent value="progress" className="space-y-4">
          {filteredProgress.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No progress data available</h3>
                <p className="text-gray-500">Progress tracking will appear here once tutoring sessions begin</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProgress.map((progress) => (
                <Card key={progress.id} className="border-l-4 border-l-[#8A2BE2]">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{progress.children.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          {progress.subject}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {progress.children.school_year}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-medium">{progress.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-[#8A2BE2] h-2 rounded-full transition-all duration-300`}
                          style={{
                            width: `${Math.min(100, Math.max(0, progress.progress_percentage))}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Grade Progression */}
                    {getGradeProgression(progress.current_grade, progress.target_grade)}

                    {/* Tutor Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="h-4 w-4" />
                      <span>{progress.tutors.name}</span>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{progress.homework_completion}%</div>
                        <div className="text-gray-500">Homework</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{progress.attendance_rate}%</div>
                        <div className="text-gray-500">Attendance</div>
                      </div>
                    </div>

                    {/* Skills & Areas for Improvement */}
                    {progress.skills_improved.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-green-700 mb-1">Skills Improved</div>
                        <div className="flex flex-wrap gap-1">
                          {progress.skills_improved.slice(0, 2).map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs bg-green-100 text-green-700">
                              {skill}
                            </Badge>
                          ))}
                          {progress.skills_improved.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{progress.skills_improved.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {progress.areas_for_improvement.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-amber-700 mb-1">Focus Areas</div>
                        <div className="flex flex-wrap gap-1">
                          {progress.areas_for_improvement.slice(0, 2).map(area => (
                            <Badge key={area} variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                              {area}
                            </Badge>
                          ))}
                          {progress.areas_for_improvement.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{progress.areas_for_improvement.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recent Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions recorded</h3>
                <p className="text-gray-500">Completed tutoring sessions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="font-medium">{session.teacher_students.children.name}</h3>
                          <Badge variant="outline">{session.teacher_students.subject}</Badge>
                          <span className="text-sm text-gray-500">{formatDate(session.date)}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {session.start_time} - {session.end_time} ({session.duration_minutes} min)
                          </div>
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            {session.teacher_students.tutors.name}
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
                            {session.session_notes}
                          </div>
                        )}
                      </div>

                      {session.rating && (
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{session.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Detailed View Tab */}
        <TabsContent value="detailed" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress by Child */}
            <Card>
              <CardHeader>
                <CardTitle>Progress by Child</CardTitle>
                <CardDescription>Overall performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {childrenList.map(child => {
                    const childProgress = progressData.filter(p => p.student_id === child.id)
                    const avgProgress = childProgress.length > 0 
                      ? Math.round(childProgress.reduce((sum, p) => sum + p.progress_percentage, 0) / childProgress.length)
                      : 0

                    return (
                      <div key={child.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{child.name}</div>
                          <div className="text-sm text-gray-500">{child.school_year}</div>
                          <div className="text-xs text-gray-400">{childProgress.length} subjects</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#8A2BE2]">{avgProgress}%</div>
                          <div className="text-xs text-gray-500">avg progress</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Progress by Subject */}
            <Card>
              <CardHeader>
                <CardTitle>Progress by Subject</CardTitle>
                <CardDescription>Subject-wise performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects.map(subject => {
                    const subjectProgress = progressData.filter(p => p.subject === subject)
                    const avgProgress = subjectProgress.length > 0 
                      ? Math.round(subjectProgress.reduce((sum, p) => sum + p.progress_percentage, 0) / subjectProgress.length)
                      : 0

                    return (
                      <div key={subject} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{subject}</div>
                          <div className="text-xs text-gray-400">{subjectProgress.length} students</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#8A2BE2]">{avgProgress}%</div>
                          <div className="text-xs text-gray-500">avg progress</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
