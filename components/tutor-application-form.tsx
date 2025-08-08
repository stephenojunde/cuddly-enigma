'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { X, Upload } from 'lucide-react'

export function TutorApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [newSubject, setNewSubject] = useState('')
  const { toast } = useToast()
  const supabase = createClient()

  const availableSubjects = [
    'Mathematics', 'English Literature', 'English Language', 'Physics', 'Chemistry', 
    'Biology', 'History', 'Geography', 'French', 'Spanish', 'German', 'Art', 
    'Music', 'Computer Science', 'Economics', 'Psychology', 'Sociology'
  ]

  const addSubject = (subject: string) => {
    if (subject && !subjects.includes(subject)) {
      setSubjects([...subjects, subject])
      setNewSubject('')
    }
  }

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject))
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    
    const applicationData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subjects: subjects,
      qualifications: formData.get('qualifications') as string,
      experience: formData.get('experience') as string,
      hourly_rate: parseFloat(formData.get('hourly_rate') as string),
      location: formData.get('location') as string,
      availability: formData.get('availability') as string,
      bio: formData.get('bio') as string,
      teaching_type: formData.getAll('teaching_type') as string[],
      levels: formData.getAll('levels') as string[]
    }

    try {
      const { error } = await supabase
        .from('tutor_applications')
        .insert([applicationData])

      if (error) throw error

      toast({
        title: "Application submitted successfully!",
        description: "We'll review your application and get back to you within 2-3 business days.",
      })

      // Reset form
      const form = document.getElementById('tutor-application-form') as HTMLFormElement
      form.reset()
      setSubjects([])
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
        <CardTitle>Tutor Application</CardTitle>
        <CardDescription>
          Please fill out all sections to complete your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="tutor-application-form" action={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
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
                <Label htmlFor="location">Location *</Label>
                <Input id="location" name="location" placeholder="City, Region" required />
              </div>
            </div>
          </div>

          {/* Teaching Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Teaching Information</h3>
            
            {/* Subjects */}
            <div>
              <Label>Subjects You Can Teach *</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Type a subject or select from suggestions"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject(newSubject))}
                />
                <Button type="button" onClick={() => addSubject(newSubject)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {availableSubjects.map(subject => (
                  <Button
                    key={subject}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSubject(subject)}
                    disabled={subjects.includes(subject)}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeSubject(subject)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Teaching Levels */}
            <div>
              <Label>Teaching Levels *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {['Primary', 'KS1', 'KS2', 'KS3', 'GCSE', 'A-Level', 'University', 'Adult'].map(level => (
                  <label key={level} className="flex items-center space-x-2">
                    <input type="checkbox" name="levels" value={level} />
                    <span className="text-sm">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Teaching Type */}
            <div>
              <Label>Teaching Type *</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="teaching_type" value="online" />
                  <span>Online</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="teaching_type" value="in-person" />
                  <span>In-person</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate (£) *</Label>
                <Input id="hourly_rate" name="hourly_rate" type="number" min="10" max="200" required />
              </div>
              <div>
                <Label htmlFor="availability">Availability *</Label>
                <Input id="availability" name="availability" placeholder="e.g., Weekdays 4-8pm, Weekends" required />
              </div>
            </div>
          </div>

          {/* Qualifications & Experience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Qualifications & Experience</h3>
            <div>
              <Label htmlFor="qualifications">Qualifications *</Label>
              <Textarea 
                id="qualifications" 
                name="qualifications" 
                placeholder="List your degrees, certifications, and relevant qualifications"
                required 
              />
            </div>
            <div>
              <Label htmlFor="experience">Teaching Experience *</Label>
              <Textarea 
                id="experience" 
                name="experience" 
                placeholder="Describe your teaching experience, including years of experience and types of students you've worked with"
                required 
              />
            </div>
            <div>
              <Label htmlFor="bio">Personal Statement</Label>
              <Textarea 
                id="bio" 
                name="bio" 
                placeholder="Tell us about your teaching philosophy and what makes you a great tutor"
              />
            </div>
          </div>

          {/* CV Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
            <div>
              <Label htmlFor="cv">Upload CV (Optional)</Label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="cv" className="relative cursor-pointer bg-white rounded-md font-medium text-[#8A2BE1] hover:text-[#5d1a9a]">
                      <span>Upload a file</span>
                      <input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx" className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || subjects.length === 0}
            className="w-full bg-[#8A2BE1] hover:bg-[#5d1a9a]"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
