'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import TutorCard from '@/components/tutor-card'
import TutorFilters from '@/components/tutor-filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter } from 'lucide-react'

interface Tutor {
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
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTutors()
  }, [])

  const fetchTutors = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('tutors')
        .select('*')
        .order('rating', { ascending: false })

      if (fetchError) {
        console.error('Error fetching tutors:', fetchError)
        setError('Failed to load tutors. Please try again.')
        return
      }

      // Filter out invalid tutor records and ensure all required fields exist
      const validTutors = (data || []).filter(tutor => {
        return tutor && 
               tutor.id && 
               typeof tutor.name === 'string' && 
               tutor.name.trim() !== ''
      }).map(tutor => ({
        ...tutor,
        name: tutor.name || 'Unknown Tutor',
        subjects: Array.isArray(tutor.subjects) ? tutor.subjects : [],
        hourly_rate: Number(tutor.hourly_rate) || 0,
        rating: Number(tutor.rating) || 0,
        total_reviews: Number(tutor.total_reviews) || 0,
        location: tutor.location || 'Location not specified',
        experience_years: Number(tutor.experience_years) || 0,
        qualifications: Array.isArray(tutor.qualifications) ? tutor.qualifications : [],
        bio: tutor.bio || 'No bio available',
        availability_status: tutor.availability_status || 'unknown'
      }))

      setTutors(validTutors)
      setFilteredTutors(validTutors)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value || ''
    setSearchTerm(term)
    filterTutors(term, filteredTutors)
  }

  const filterTutors = (searchTerm: string, tutorsToFilter: Tutor[]) => {
    let filtered = tutorsToFilter

    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(tutor => {
        const name = (tutor.name || '').toLowerCase()
        const location = (tutor.location || '').toLowerCase()
        const bio = (tutor.bio || '').toLowerCase()
        const subjects = Array.isArray(tutor.subjects) 
          ? tutor.subjects.map(s => (s || '').toLowerCase()).join(' ')
          : ''

        return name.includes(lowerSearchTerm) ||
               location.includes(lowerSearchTerm) ||
               bio.includes(lowerSearchTerm) ||
               subjects.includes(lowerSearchTerm)
      })
    }

    setFilteredTutors(filtered)
  }

  const handleFiltersChange = (filters: any) => {
    let filtered = [...tutors]

    // Apply subject filter
    if (filters.subject) {
      filtered = filtered.filter(tutor => {
        const subjects = Array.isArray(tutor.subjects) ? tutor.subjects : []
        return subjects.some(subject => 
          (subject || '').toLowerCase().includes(filters.subject.toLowerCase())
        )
      })
    }

    // Apply level filter (this would need to be added to tutor data structure)
    if (filters.level) {
      // For now, we'll skip level filtering since it's not in our current data structure
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(tutor => 
        (tutor.location || '').toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Apply price range filter
    if (filters.priceRange && Array.isArray(filters.priceRange)) {
      const [min, max] = filters.priceRange
      filtered = filtered.filter(tutor => {
        const rate = Number(tutor.hourly_rate) || 0
        return rate >= min && rate <= max
      })
    }

    // Apply experience filter
    if (filters.experience) {
      filtered = filtered.filter(tutor => {
        const experience = Number(tutor.experience_years) || 0
        switch (filters.experience) {
          case '0-1':
            return experience <= 1
          case '1-3':
            return experience > 1 && experience <= 3
          case '3-5':
            return experience > 3 && experience <= 5
          case '5-10':
            return experience > 5 && experience <= 10
          case '10+':
            return experience > 10
          default:
            return true
        }
      })
    }

    // Apply rating filter
    if (filters.rating) {
      const minRating = Number(filters.rating) || 0
      filtered = filtered.filter(tutor => {
        const rating = Number(tutor.rating) || 0
        return rating >= minRating
      })
    }

    setFilteredTutors(filtered)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tutors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchTutors}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Tutor</h1>
        <p className="text-gray-600 mb-6">
          Browse our qualified tutors and find the perfect match for your learning needs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, subject, or location..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mb-6">
            <TutorFilters onFiltersChange={handleFiltersChange} />
          </div>
        )}
      </div>

      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Showing {filteredTutors.length} of {tutors.length} tutors
        </p>
      </div>

      {filteredTutors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No tutors found matching your criteria.</p>
          <Button onClick={() => {
            setSearchTerm('')
            setFilteredTutors(tutors)
          }}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      )}
    </div>
  )
}
