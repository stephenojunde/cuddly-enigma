import { createClient } from '@/lib/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Calendar, Clock, DollarSign, Building } from 'lucide-react'
import { JobApplicationForm } from '@/components/job-application-form'
import { safeString, safeNumber, safeDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface JobDetailPageProps {
  params: {
    id: string
  }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const supabase = await createClient()
  
  const { data: job } = await supabase
    .from('jobs')
    .select(`
      *,
      schools (
        name,
        address,
        postcode,
        phone,
        email,
        website,
        school_type,
        description,
        logo_url
      )
    `)
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (!job) {
    notFound()
  }

  const jobTitle = safeString(job.title, 'Job Title Not Available')
  const jobDescription = safeString(job.description, 'No description available')
  const jobRequirements = safeString(job.requirements, 'No requirements specified')
  const jobLocation = safeString(job.location, 'Location not specified')
  const contractType = safeString(job.contract_type, 'Contract type not specified')
  const subject = safeString(job.subject)
  const level = safeString(job.level)
  const salaryMin = safeNumber(job.salary_min)
  const salaryMax = safeNumber(job.salary_max)
  const startDate = safeDate(job.start_date)
  const applicationDeadline = safeDate(job.application_deadline)
  
  const school = job.schools
  const schoolName = safeString(school?.name, 'School Name Not Available')
  const schoolAddress = safeString(school?.address)
  const schoolType = safeString(school?.school_type)
  const schoolDescription = safeString(school?.description)

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{jobTitle}</CardTitle>
                  <CardDescription className="text-lg">
                    {schoolName} • {jobLocation}
                  </CardDescription>
                </div>
                <div className="text-right">
                  {salaryMin > 0 && salaryMax > 0 && (
                    <p className="text-xl font-bold text-[#8A2BE1]">
                      £{salaryMin.toLocaleString()} - £{salaryMax.toLocaleString()}
                    </p>
                  )}
                  <Badge variant="secondary" className="capitalize mt-2">
                    {contractType}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{jobLocation}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Building className="h-4 w-4 mr-2" />
                  <span className="text-sm capitalize">{schoolType} School</span>
                </div>
                {subject && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{subject}</span>
                  </div>
                )}
                {level && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">{level}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {startDate && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Start Date</h4>
                    <p className="text-gray-600">{startDate.toLocaleDateString()}</p>
                  </div>
                )}
                {applicationDeadline && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Application Deadline</h4>
                    <p className="text-gray-600">{applicationDeadline.toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{jobDescription}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{jobRequirements}</p>
                  </div>
                </div>

                {schoolDescription && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About {schoolName}</h3>
                    <p className="text-gray-700">{schoolDescription}</p>
                    {schoolAddress && (
                      <p className="text-gray-600 mt-2">{schoolAddress}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <JobApplicationForm jobId={job.id} jobTitle={jobTitle} schoolName={schoolName} />
        </div>
      </div>
    </main>
  )
}
