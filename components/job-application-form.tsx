'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Upload } from 'lucide-react'

interface JobApplicationFormProps {
  jobId: string
  jobTitle: string
  schoolName: string
}

export function JobApplicationForm({ jobId, jobTitle, schoolName }: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    
    const applicationData = {
      job_id: jobId,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      cover_letter: formData.get('cover_letter') as string,
      experience: formData.get('experience') as string,
      qualifications: formData.get('qualifications') as string,
      availability: formData.get('availability') as string,
      status: 'pending'
    }

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert([applicationData])

      if (error) throw error

      toast({
        title: "Application submitted successfully!",
        description: `Your application for ${jobTitle} at ${schoolName} has been submitted.`,
      })

      // Reset form
      const form = document.getElementById('job-application-form') as HTMLFormElement
      form.reset()
    } catch (error: any) {
      toast({
        title: "Error submitting application",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for this Position</CardTitle>
        <CardDescription>
          Submit your application for {jobTitle} at {schoolName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="job-application-form" action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" name="phone" type="tel" required />
            </div>
            <div>
              <Label htmlFor="availability">Availability *</Label>
              <Input id="availability" name="availability" placeholder="e.g., Immediate, 2 weeks notice" required />
            </div>
          </div>

          <div>
            <Label htmlFor="qualifications">Qualifications *</Label>
            <Textarea 
              id="qualifications" 
              name="qualifications" 
              placeholder="List your relevant qualifications, degrees, and certifications"
              required 
            />
          </div>

          <div>
            <Label htmlFor="experience">Relevant Experience *</Label>
            <Textarea 
              id="experience" 
              name="experience" 
              placeholder="Describe your relevant teaching or educational experience"
              required 
            />
          </div>

          <div>
            <Label htmlFor="cover_letter">Cover Letter *</Label>
            <Textarea 
              id="cover_letter" 
              name="cover_letter" 
              placeholder="Explain why you're interested in this position and what you can bring to the role"
              className="min-h-[120px]"
              required 
            />
          </div>

          <div>
            <Label htmlFor="cv">Upload CV *</Label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="cv" className="relative cursor-pointer bg-white rounded-md font-medium text-[#8A2BE1] hover:text-[#5d1a9a]">
                    <span>Upload your CV</span>
                    <input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx" className="sr-only" required />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#8A2BE1] hover:bg-[#5d1a9a]"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
