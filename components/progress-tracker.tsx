"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Calendar, BookOpen, Star, Target, Clock } from 'lucide-react'

interface Child {
  id: string
  name: string
  age: number
  grade: string
  subjects: string[]
  special_needs?: string[]
}

interface ProgressReport {
  id: string
  child_id: string
  tutor_id: string
  subject: string
  session_date: string
  progress_notes?: string
  skills_improved?: string[]
  areas_for_improvement?: string[]
  homework_completion?: number
  attendance_rate?: number
  overall_rating?: number
  children: {
    name: string
    age: number
    grade: string
  }
  tutors: {
    name: string
    subjects: string[]
  }
}

interface RecentBooking {
  id: string
  student_name: string
  subject: string
  session_date: string
  status: string
  tutors: {
    name: string
    subjects: string[]
  }
}

interface ProgressTrackerProps {
  children: Child[]
  progressReports: ProgressReport[]
  recentBookings: RecentBooking[]
  currentUserId: string
}

export function ProgressTracker({ children, progressReports, recentBookings }: ProgressTrackerProps) {
  const [selectedChild, setSelectedChild] = useState<string>(children[0]?.id || '')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('3months')

  // Helper functions
  const getChildProgress = (childId: string) => {
    return progressReports.filter(report => report.child_id === childId)
  }

  const getChildBookings = (childName: string) => {
    return recentBookings.filter(booking => booking.student_name === childName)
  }

  const getFilteredReports = (childId: string) => {
    let reports = getChildProgress(childId)
    
    if (selectedSubject !== 'all') {
      reports = reports.filter(report => report.subject === selectedSubject)
    }

    const now = new Date()
    const cutoff = new Date()
    
    switch (timeRange) {
      case '1month':
        cutoff.setMonth(now.getMonth() - 1)
        break
      case '3months':
        cutoff.setMonth(now.getMonth() - 3)
        break
      case '6months':
        cutoff.setMonth(now.getMonth() - 6)
        break
      case '1year':
        cutoff.setFullYear(now.getFullYear() - 1)
        break
      default:
        return reports
    }

    return reports.filter(report => new Date(report.session_date) >= cutoff)
  }

  const getAverageRating = (reports: ProgressReport[]) => {
    const ratingsReports = reports.filter(r => r.overall_rating)
    if (ratingsReports.length === 0) return 0
    return ratingsReports.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / ratingsReports.length
  }

  const getAverageHomeworkCompletion = (reports: ProgressReport[]) => {
    const homeworkReports = reports.filter(r => r.homework_completion !== undefined)
    if (homeworkReports.length === 0) return 0
    return homeworkReports.reduce((sum, r) => sum + (r.homework_completion || 0), 0) / homeworkReports.length
  }

  const getAverageAttendance = (reports: ProgressReport[]) => {
    const attendanceReports = reports.filter(r => r.attendance_rate !== undefined)
    if (attendanceReports.length === 0) return 100
    return attendanceReports.reduce((sum, r) => sum + (r.attendance_rate || 100), 0) / attendanceReports.length
  }

  const getProgressTrend = (reports: ProgressReport[]) => {
    if (reports.length < 2) return 'stable'
    
    const sortedReports = [...reports].sort((a, b) => 
      new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
    )
    
    const recentAvg = getAverageRating(sortedReports.slice(-3))
    const olderAvg = getAverageRating(sortedReports.slice(0, -3))
    
    if (recentAvg > olderAvg + 0.5) return 'improving'
    if (recentAvg < olderAvg - 0.5) return 'declining'
    return 'stable'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Target className="h-4 w-4 text-blue-600" />
    }
  }

  const selectedChildData = children.find(child => child.id === selectedChild)
  const childReports = selectedChildData ? getFilteredReports(selectedChildData.id) : []
  const childBookings = selectedChildData ? getChildBookings(selectedChildData.name) : []
  const trend = getProgressTrend(childReports)

  if (children.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Children Added</h3>
          <p className="text-gray-600 text-center mb-4">
            Add your children to start tracking their academic progress
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Select Child</label>
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name} - {child.grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Subject</label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {selectedChildData?.subjects?.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Time Range</label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedChildData && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Detailed Reports</TabsTrigger>
            <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overall Rating</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {getAverageRating(childReports).toFixed(1)}/5
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(trend)}
                    <span className="text-sm text-gray-600 ml-1 capitalize">{trend}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Homework Completion</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(getAverageHomeworkCompletion(childReports))}%
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(getAverageAttendance(childReports))}%
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{childReports.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Child Profile */}
            <Card>
              <CardHeader>
                <CardTitle>{selectedChildData.name} - Profile</CardTitle>
                <CardDescription>Academic information and learning details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Age</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedChildData.age} years old</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Grade</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedChildData.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Subjects</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedChildData.subjects?.map((subject, index) => (
                        <Badge key={index} variant="outline">
                          {subject}
                        </Badge>
                      )) || <span className="text-gray-500">No subjects specified</span>}
                    </div>
                  </div>
                </div>
                {selectedChildData.special_needs && selectedChildData.special_needs.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Special Learning Needs</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedChildData.special_needs.map((need, index) => (
                        <Badge key={index} variant="secondary">
                          {need}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {childReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No progress reports found for the selected filters.</p>
                </CardContent>
              </Card>
            ) : (
              childReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{report.subject}</CardTitle>
                        <CardDescription>
                          Session with {report.tutors.name} • {new Date(report.session_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {report.overall_rating && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {report.overall_rating}/5
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {report.progress_notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Progress Notes</h4>
                        <p className="text-gray-600">{report.progress_notes}</p>
                      </div>
                    )}

                    {report.skills_improved && report.skills_improved.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Skills Improved</h4>
                        <div className="flex flex-wrap gap-1">
                          {report.skills_improved.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-green-700 border-green-300">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.areas_for_improvement && report.areas_for_improvement.length > 0 && (
                      <div>
                        <h4 className="font-medium text-orange-700 mb-2">Areas for Improvement</h4>
                        <div className="flex flex-wrap gap-1">
                          {report.areas_for_improvement.map((area, index) => (
                            <Badge key={index} variant="outline" className="text-orange-700 border-orange-300">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {report.homework_completion !== undefined && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Homework Completion</h4>
                          <p className="text-lg font-semibold text-gray-700">{report.homework_completion}%</p>
                        </div>
                      )}
                      {report.attendance_rate !== undefined && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Attendance Rate</h4>
                          <p className="text-lg font-semibold text-gray-700">{report.attendance_rate}%</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            {childBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No recent sessions found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {childBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{booking.subject}</h3>
                          <p className="text-gray-600">with {booking.tutors.name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(booking.session_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={booking.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}