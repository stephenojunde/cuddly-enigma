'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Clock, GraduationCap, Shield } from 'lucide-react'
import Link from 'next/link'

interface TutorCardProps {
  tutor: {
    id: string
    name: string
    subjects: string[]
    hourly_rate: number
    rating: number
    total_reviews: number
    location: string
    experience_years: number
    qualifications: string[]
    bio: string
    profile_image_url?: string
    availability_status: string
    dbs_status?: string
  }
}

export default function TutorCard({ tutor }: TutorCardProps) {
  // Safe string conversion with fallbacks
  const safeName = tutor?.name?.toString() || 'Unknown Tutor'
  const safeLocation = tutor?.location?.toString() || 'Location not specified'
  const safeBio = tutor?.bio?.toString() || 'No bio available'
  const safeAvailability = tutor?.availability_status?.toString() || 'unknown'
  const safeDBSStatus = tutor?.dbs_status?.toString() || 'pending'
  
  // Safe array handling
  const safeSubjects = Array.isArray(tutor?.subjects) 
    ? tutor.subjects.filter(Boolean).map(s => s?.toString() || '') 
    : []
  
  const safeQualifications = Array.isArray(tutor?.qualifications) 
    ? tutor.qualifications.filter(Boolean).map(q => q?.toString() || '') 
    : []

  // Safe number handling
  const safeRate = !isNaN(Number(tutor?.hourly_rate)) ? Number(tutor.hourly_rate) : 0
  const safeRating = !isNaN(Number(tutor?.rating)) ? Number(tutor.rating) : 0
  const safeReviews = !isNaN(Number(tutor?.total_reviews)) ? Number(tutor.total_reviews) : 0
  const safeExperience = !isNaN(Number(tutor?.experience_years)) ? Number(tutor.experience_years) : 0

  const getAvailabilityColor = (status: string) => {
    const normalizedStatus = status.toString().toLowerCase()
    switch (normalizedStatus) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'busy':
        return 'bg-yellow-100 text-yellow-800'
      case 'unavailable':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAvailabilityText = (status: string) => {
    const normalizedStatus = status.toString().toLowerCase()
    switch (normalizedStatus) {
      case 'available':
        return 'Available'
      case 'busy':
        return 'Busy'
      case 'unavailable':
        return 'Unavailable'
      default:
        return 'Unknown'
    }
  }

  const getDBSStatusBadge = (status: string) => {
    const normalizedStatus = status.toString().toLowerCase()
    switch (normalizedStatus) {
      case 'verified':
        return { color: 'bg-green-100 text-green-800', text: 'DBS Verified', icon: Shield }
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'DBS Pending', icon: Shield }
      case 'expired':
        return { color: 'bg-red-100 text-red-800', text: 'DBS Expired', icon: Shield }
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', text: 'DBS Rejected', icon: Shield }
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'DBS Unknown', icon: Shield }
    }
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {safeName.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg">{safeName}</CardTitle>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {safeLocation}
              </div>
            </div>
          </div>
          <Badge className={getAvailabilityColor(safeAvailability)}>
            {getAvailabilityText(safeAvailability)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{safeRating.toFixed(1)}</span>
            <span className="text-sm text-gray-600">({safeReviews} reviews)</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">£{safeRate}</div>
            <div className="text-sm text-gray-600">per hour</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {safeExperience} years experience
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <GraduationCap className="w-4 h-4 mr-2" />
            {safeQualifications.length > 0 ? safeQualifications[0] : 'No qualifications listed'}
          </div>
          <div className="flex items-center gap-2">
            {(() => {
              const dbsInfo = getDBSStatusBadge(safeDBSStatus)
              const IconComponent = dbsInfo.icon
              return (
                <Badge className={`${dbsInfo.color} flex items-center gap-1 text-xs`}>
                  <IconComponent className="w-3 h-3" />
                  {dbsInfo.text}
                </Badge>
              )
            })()}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Subjects:</div>
          <div className="flex flex-wrap gap-1">
            {safeSubjects.length > 0 ? (
              safeSubjects.slice(0, 3).map((subject, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="text-xs">
                No subjects listed
              </Badge>
            )}
            {safeSubjects.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{safeSubjects.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {safeBio}
        </p>

        <div className="flex space-x-2 pt-2">
          <Button asChild className="flex-1">
            <Link href={`/tutors/${tutor?.id || ''}`}>
              View Profile
            </Link>
          </Button>
          <Button variant="outline" className="flex-1">
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
