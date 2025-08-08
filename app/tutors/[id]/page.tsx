import { createClient } from '@/lib/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, MapPin, Clock, GraduationCap } from 'lucide-react'
import { safeString, safeNumber, safeArray } from '@/lib/utils'

interface TutorDetailPageProps {
  params: {
    id: string
  }
}

export default async function TutorDetailPage({ params }: TutorDetailPageProps) {
  const supabase = await createClient()
  
  const { data: tutor } = await supabase
    .from('tutors')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .eq('is_verified', true)
    .single()

  if (!tutor) {
    notFound()
  }

  // Safe property extraction
  const tutorName = safeString(tutor.name, 'Tutor Name')
  const tutorSubjects = safeArray(tutor.subjects)
  const tutorLevels = safeArray(tutor.levels)
  const tutorLocation = safeString(tutor.location, 'Location not specified')
  const tutorRate = safeNumber(tutor.hourly_rate, 0)
  const tutorRating = safeNumber(tutor.rating, 0)
  const tutorReviews = safeNumber(tutor.total_reviews, 0)
  const tutorBio = safeString(tutor.bio, 'No bio available')
  const tutorAvailability = safeString(tutor.availability, 'Availability not specified')
  const tutorExperience = safeNumber(tutor.experience_years, 0)
  const tutorQualifications = safeString(tutor.qualifications, 'Not specified')
  const teachingTypes = safeArray(tutor.teaching_type)
  const avatarUrl = safeString(tutor.avatar_url, "/placeholder.svg?height=200&width=200")
  const firstName = tutorName.split(' ')[0] || 'Tutor'

  return (
    <main>
      <section className="bg-[#f3eefd] py-20">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-lg shadow-md p-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="flex-shrink-0">
              <Image
                src={avatarUrl || "/placeholder.svg"}
                alt={`${tutorName} profile picture`}
                width={200}
                height={200}
                className="rounded-full w-48 h-48 object-cover border-4 border-[#8A2BE1]"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{tutorName}</h1>
              <p className="text-xl text-gray-600 mb-4">
                {tutorSubjects.length > 0 ? tutorSubjects.join(' & ') + ' Tutor' : 'Tutor'}
              </p>
              
              <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-600">
                    {tutorRating.toFixed(1)} ({tutorReviews} reviews)
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {tutorLocation}
                </div>
              </div>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{tutorBio}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Specializations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tutorSubjects.length > 0 ? (
                        tutorSubjects.map((subject, index) => (
                          <Badge key={`subject-${index}`} variant="secondary">
                            {safeString(subject)}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No subjects specified</p>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Levels:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {tutorLevels.length > 0 ? (
                          tutorLevels.map((level, index) => (
                            <Badge key={`level-${index}`} variant="outline">
                              {safeString(level)}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No levels specified</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Availability & Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-[#8A2BE1] mb-2">
                      £{tutorRate.toFixed(2)}/hour
                    </p>
                    <p className="text-sm text-gray-600 mb-3">{tutorAvailability}</p>
                    <div className="flex flex-wrap gap-2">
                      {teachingTypes.length > 0 ? (
                        teachingTypes.map((type, index) => (
                          <Badge key={`type-${index}`} variant="outline" className="capitalize">
                            {safeString(type)}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">Not specified</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Experience & Qualifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-2">
                    <strong>Experience:</strong> {tutorExperience} years
                  </p>
                  <p className="text-gray-700">
                    <strong>Qualifications:</strong> {tutorQualifications}
                  </p>
                </CardContent>
              </Card>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-3 px-6 rounded-full text-lg flex-1">
                  Request a Session with {firstName}
                </Button>
                <Button variant="outline" className="border-[#8A2BE1] text-[#8A2BE1] hover:bg-[#8A2BE1] hover:text-white font-bold py-3 px-6 rounded-full text-lg">
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
