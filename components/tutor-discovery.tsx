'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Heart, Star, MapPin, Clock, BookOpen, Filter, Search } from 'lucide-react'

interface Tutor {
  id: string
  name: string
  bio?: string
  subjects: string[]
  hourly_rate: number
  location: string
  experience_years: number
  education?: string
  is_verified: boolean
  avatar_url?: string
  rating?: number
  total_reviews?: number
}

interface TutorDiscoveryProps {
  tutors: Tutor[]
  userBookings: { tutor_id: string; status: string }[]
  favorites: { tutor_id: string }[]
  currentUserId: string
}

export function TutorDiscovery({ tutors, userBookings, favorites, currentUserId }: TutorDiscoveryProps) {
  const [filteredTutors, setFilteredTutors] = useState(tutors)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Get unique subjects and locations for filters
  const allSubjects = [...new Set(tutors.flatMap(tutor => tutor.subjects))]
  const allLocations = [...new Set(tutors.map(tutor => tutor.location))]

  const favoriteIds = new Set(favorites.map(f => f.tutor_id))
  const bookedTutorIds = new Set(userBookings.map(b => b.tutor_id))

  const applyFilters = () => {
    let filtered = tutors

    if (searchTerm) {
      filtered = filtered.filter(tutor => 
        tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (subjectFilter && subjectFilter !== 'all') {
      filtered = filtered.filter(tutor => tutor.subjects.includes(subjectFilter))
    }

    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter(tutor => tutor.location === locationFilter)
    }

    if (priceRange && priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      filtered = filtered.filter(tutor => {
        if (max) {
          return tutor.hourly_rate >= min && tutor.hourly_rate <= max
        } else {
          return tutor.hourly_rate >= min
        }
      })
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(tutor => favoriteIds.has(tutor.id))
    }

    setFilteredTutors(filtered)
  }

  const toggleFavorite = async (tutorId: string) => {
    try {
      const isFavorite = favoriteIds.has(tutorId)
      
      if (isFavorite) {
        const { error } = await supabase
          .from('favorite_tutors')
          .delete()
          .eq('parent_id', currentUserId)
          .eq('tutor_id', tutorId)
        
        if (error) throw error
        favoriteIds.delete(tutorId)
        toast({ title: "Removed from favorites" })
      } else {
        const { error } = await supabase
          .from('favorite_tutors')
          .insert({ parent_id: currentUserId, tutor_id: tutorId })
        
        if (error) throw error
        favoriteIds.add(tutorId)
        toast({ title: "Added to favorites" })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: "Error updating favorites",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Tutors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tutors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {allSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {allLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="0-20">£0 - £20/hr</SelectItem>
                <SelectItem value="20-40">£20 - £40/hr</SelectItem>
                <SelectItem value="40-60">£40 - £60/hr</SelectItem>
                <SelectItem value="60">£60+/hr</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button 
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => {
                setShowFavoritesOnly(!showFavoritesOnly)
                applyFilters()
              }}
            >
              <Heart className="h-4 w-4 mr-2" />
              Favorites Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutors.map((tutor) => (
          <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={tutor.avatar_url} />
                    <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{tutor.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {tutor.is_verified && (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                      {bookedTutorIds.has(tutor.id) && (
                        <Badge variant="outline">Previously Booked</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(tutor.id)}
                >
                  <Heart 
                    className={`h-4 w-4 ${favoriteIds.has(tutor.id) ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {tutor.subjects.slice(0, 3).map(subject => (
                      <Badge key={subject} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                    {tutor.subjects.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{tutor.subjects.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{tutor.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{tutor.experience_years} years experience</span>
                </div>

                {tutor.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm">
                      {tutor.rating.toFixed(1)} ({tutor.total_reviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <span className="text-2xl font-bold">£{tutor.hourly_rate}</span>
                  <span className="text-gray-500">/hour</span>
                </div>
                <Button>Book Session</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTutors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No tutors found matching your criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setSubjectFilter('all')
                setLocationFilter('all')
                setPriceRange('all')
                setShowFavoritesOnly(false)
                setFilteredTutors(tutors)
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}