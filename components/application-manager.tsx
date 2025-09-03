'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Briefcase, MapPin, DollarSign, Calendar, Send, Eye, Building } from 'lucide-react'

interface Application {
  id: string
  job_id: string
  status: string
  cover_letter?: string
  applied_at: string
  reviewed_at?: string
  notes?: string
  jobs: {
    title: string
    description: string
    subjects: string[]
    location: string
    salary_range?: string
    requirements?: string
    schools: { name: string }
  }
}

interface Job {
  id: string
  title: string
  description: string
  subjects: string[]
  location: string
  salary_range?: string
  requirements?: string
  created_at: string
  schools: {
    name: string
    location: string
  }
}

interface ApplicationManagerProps {
  tutorId: string
  applications: Application[]
  availableJobs: Job[]
  currentUserId: string
}

export function ApplicationManager({ tutorId, applications: initialApplications, availableJobs }: ApplicationManagerProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const applyToJob = async (jobId: string) => {
    if (!coverLetter.trim()) {
      toast({
        title: "Cover letter required",
        description: "Please write a cover letter for your application.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert([{
          tutor_id: tutorId,
          job_id: jobId,
          cover_letter: coverLetter,
          status: 'pending'
        }])
        .select(`
          *,
          jobs(title, description, subjects, location, salary_range, requirements, schools(name))
        `)
        .single()

      if (error) throw error

      setApplications([data, ...applications])
      setCoverLetter('')
      setSelectedJob(null)
      setIsApplying(false)
      
      toast({
        title: "Application submitted",
        description: "Your job application has been sent successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error submitting application",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'default'
      case 'rejected': return 'destructive'
      case 'reviewed': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Under Review'
      case 'reviewed': return 'Reviewed'
      case 'accepted': return 'Accepted'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  // Group applications by status
  const pendingApplications = applications.filter(app => app.status === 'pending')
  const reviewedApplications = applications.filter(app => app.status === 'reviewed')
  const acceptedApplications = applications.filter(app => app.status === 'accepted')
  const rejectedApplications = applications.filter(app => app.status === 'rejected')

  return (
    <div className="space-y-6">
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">My Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="jobs">Available Jobs ({availableJobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          {/* Application Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{reviewedApplications.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{acceptedApplications.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{rejectedApplications.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {applications.length > 0 ? (
              applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{application.jobs.title}</CardTitle>
                        <CardDescription>
                          {application.jobs.schools.name} • Applied {new Date(application.applied_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusColor(application.status)}>
                        {getStatusText(application.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{application.jobs.location}</span>
                      </div>
                      {application.jobs.salary_range && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>{application.jobs.salary_range}</span>
                        </div>
                      )}
                      {application.reviewed_at && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Reviewed {new Date(application.reviewed_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Subjects</h4>
                      <div className="flex flex-wrap gap-1">
                        {application.jobs.subjects.map(subject => (
                          <Badge key={subject} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {application.cover_letter && (
                      <div>
                        <h4 className="font-medium mb-2">Cover Letter</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}

                    {application.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Feedback</h4>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                          {application.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No applications yet.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Browse available jobs and start applying!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="space-y-6">
            {availableJobs.length > 0 ? (
              availableJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription>
                          {job.schools.name} • Posted {new Date(job.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedJob(job)
                          setIsApplying(true)
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{job.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span>{job.schools.location}</span>
                      </div>
                      {job.salary_range && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>{job.salary_range}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Subjects Required</h4>
                      <div className="flex flex-wrap gap-1">
                        {job.subjects.map(subject => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {job.requirements && (
                      <div>
                        <h4 className="font-medium mb-2">Requirements</h4>
                        <p className="text-sm text-gray-600">{job.requirements}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No available jobs at the moment.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Check back later for new opportunities.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Modal */}
      {isApplying && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Apply for {selectedJob.title}</CardTitle>
              <CardDescription>{selectedJob.schools.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Job Description</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {selectedJob.description}
                </p>
              </div>

              <div>
                <Label htmlFor="cover-letter">Cover Letter *</Label>
                <Textarea
                  id="cover-letter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write a compelling cover letter explaining why you're the perfect fit for this position..."
                  rows={8}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => applyToJob(selectedJob.id)}
                  disabled={!coverLetter.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsApplying(false)
                    setSelectedJob(null)
                    setCoverLetter('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}