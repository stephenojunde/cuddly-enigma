'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Save } from 'lucide-react'

interface Profile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  user_type: string
  phone?: string
  bio?: string
  date_of_birth?: string
  address?: string
  emergency_contact?: string
  avatar_url?: string
}

interface TutorProfile {
  id: string
  name: string
  subjects: string[]
  hourly_rate: number
  location: string
  bio: string
  qualifications: string[]
  experience_years: number
  languages: string[]
  is_verified: boolean
  rating: number
}

interface ProfileFormProps {
  user: User
  profile: Profile | null
  tutorProfile: TutorProfile | null
}

export default function ProfileForm({ user, profile, tutorProfile }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const { toast } = useToast()
  
  // Form states
  const [personalData, setPersonalData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    date_of_birth: profile?.date_of_birth || '',
    address: profile?.address || '',
    emergency_contact: profile?.emergency_contact || '',
  })

  const [tutorData, setTutorData] = useState({
    name: tutorProfile?.name || '',
    subjects: tutorProfile?.subjects || [],
    hourly_rate: tutorProfile?.hourly_rate || 0,
    location: tutorProfile?.location || '',
    bio: tutorProfile?.bio || '',
    qualifications: tutorProfile?.qualifications || [],
    experience_years: tutorProfile?.experience_years || 0,
    languages: tutorProfile?.languages || [],
  })

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ...personalData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your personal information has been saved successfully.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      if (tutorProfile) {
        // Update existing tutor profile
        const { error } = await supabase
          .from('tutors')
          .update({
            ...tutorData,
            updated_at: new Date().toISOString(),
          })
          .eq('profile_id', user.id)

        if (error) throw error
      } else {
        // Create new tutor profile
        const { error } = await supabase
          .from('tutors')
          .insert({
            profile_id: user.id,
            ...tutorData,
          })

        if (error) throw error
      }

      toast({
        title: "Tutor profile updated",
        description: "Your tutor information has been saved successfully.",
      })
    } catch (error) {
      console.error('Error updating tutor profile:', error)
      toast({
        title: "Error",
        description: "Failed to update tutor profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addSubject = (subject: string) => {
    if (subject && !tutorData.subjects.includes(subject)) {
      setTutorData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }))
    }
  }

  const removeSubject = (subject: string) => {
    setTutorData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }))
  }

  const addQualification = (qualification: string) => {
    if (qualification && !tutorData.qualifications.includes(qualification)) {
      setTutorData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, qualification]
      }))
    }
  }

  const removeQualification = (qualification: string) => {
    setTutorData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q !== qualification)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="icon" 
                variant="outline" 
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.full_name || user.email}</h2>
              <p className="text-gray-600 capitalize">{profile?.user_type}</p>
              {profile?.user_type === 'teacher' && tutorProfile?.is_verified && (
                <Badge className="mt-1">Verified Tutor</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'personal'
                ? 'border-[#8A2BE1] text-[#8A2BE1]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Personal Information
          </button>
          {profile?.user_type === 'teacher' && (
            <button
              onClick={() => setActiveTab('tutor')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tutor'
                  ? 'border-[#8A2BE1] text-[#8A2BE1]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tutor Profile
            </button>
          )}
        </nav>
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'personal' && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePersonalSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={personalData.first_name}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={personalData.last_name}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={personalData.full_name}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={personalData.date_of_birth}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={personalData.address}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your address"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={personalData.emergency_contact}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                  placeholder="Emergency contact information"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={personalData.bio}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tutor Profile Tab */}
      {activeTab === 'tutor' && profile?.user_type === 'teacher' && (
        <Card>
          <CardHeader>
            <CardTitle>Tutor Profile</CardTitle>
            <CardDescription>Manage your tutoring information and qualifications</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTutorSubmit} className="space-y-6">
              <div>
                <Label htmlFor="tutor_name">Professional Name</Label>
                <Input
                  id="tutor_name"
                  value={tutorData.name}
                  onChange={(e) => setTutorData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="How you want to be known to students"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate (£)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={tutorData.hourly_rate}
                    onChange={(e) => setTutorData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="25.00"
                  />
                </div>
                <div>
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    value={tutorData.experience_years}
                    onChange={(e) => setTutorData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={tutorData.location}
                  onChange={(e) => setTutorData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., London, Birmingham, Online"
                />
              </div>

              <div>
                <Label>Subjects</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tutorData.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary" className="cursor-pointer" onClick={() => removeSubject(subject)}>
                      {subject} ×
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Art">Art</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Qualifications</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tutorData.qualifications.map((qualification) => (
                    <Badge key={qualification} variant="outline" className="cursor-pointer" onClick={() => removeQualification(qualification)}>
                      {qualification} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add qualification (press Enter)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addQualification(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tutor_bio">Professional Bio</Label>
                <Textarea
                  id="tutor_bio"
                  value={tutorData.bio}
                  onChange={(e) => setTutorData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Describe your teaching experience, methodology, and what makes you unique as a tutor"
                  rows={6}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Tutor Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
