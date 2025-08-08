'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'

export function AdvancedSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState({
    subject: searchParams.get('subject') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    minRate: parseInt(searchParams.get('minRate') || '0'),
    maxRate: parseInt(searchParams.get('maxRate') || '100'),
    levels: searchParams.get('levels')?.split(',') || [],
    rating: parseFloat(searchParams.get('rating') || '0'),
    availability: searchParams.get('availability') || '',
    experience: searchParams.get('experience') || ''
  })

  const subjects = [
    'Mathematics', 'English Literature', 'English Language', 'Physics', 
    'Chemistry', 'Biology', 'History', 'Geography', 'French', 'Spanish',
    'German', 'Art', 'Music', 'Computer Science', 'Economics', 'Psychology'
  ]

  const levels = ['Primary', 'KS1', 'KS2', 'KS3', 'GCSE', 'A-Level', 'University', 'Adult']

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','))
          }
        } else {
          params.set(key, value.toString())
        }
      }
    })

    router.push(`/tutors?${params.toString()}`)
  }

  const handleLevelChange = (level: string, checked: boolean) => {
    const newLevels = checked 
      ? [...filters.levels, level]
      : filters.levels.filter(l => l !== level)
    
    setFilters({ ...filters, levels: newLevels })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subject */}
        <div>
          <Label>Subject</Label>
          <Select value={filters.subject} onValueChange={(value) => setFilters({...filters, subject: value})}>
            <SelectTrigger>
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, postcode, or 'online'"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          />
        </div>

        {/* Teaching Type */}
        <div>
          <Label>Teaching Type</Label>
          <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Any Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Type</SelectItem>
              <SelectItem value="online">Online Only</SelectItem>
              <SelectItem value="in-person">In-Person Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <Label>Hourly Rate: £{filters.minRate} - £{filters.maxRate}</Label>
          <div className="px-2 py-4">
            <Slider
              value={[filters.minRate, filters.maxRate]}
              onValueChange={([min, max]) => setFilters({...filters, minRate: min, maxRate: max})}
              max={200}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Levels */}
        <div>
          <Label>Teaching Levels</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {levels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={level}
                  checked={filters.levels.includes(level)}
                  onCheckedChange={(checked) => handleLevelChange(level, checked as boolean)}
                />
                <Label htmlFor={level} className="text-sm">{level}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Minimum Rating */}
        <div>
          <Label>Minimum Rating</Label>
          <Select value={filters.rating.toString()} onValueChange={(value) => setFilters({...filters, rating: parseFloat(value)})}>
            <SelectTrigger>
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Rating</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="4.5">4.5+ Stars</SelectItem>
              <SelectItem value="4.8">4.8+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Experience */}
        <div>
          <Label>Minimum Experience</Label>
          <Select value={filters.experience} onValueChange={(value) => setFilters({...filters, experience: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Any Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Experience</SelectItem>
              <SelectItem value="1">1+ Years</SelectItem>
              <SelectItem value="3">3+ Years</SelectItem>
              <SelectItem value="5">5+ Years</SelectItem>
              <SelectItem value="10">10+ Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Availability */}
        <div>
          <Label>Availability</Label>
          <Select value={filters.availability} onValueChange={(value) => setFilters({...filters, availability: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Any Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Time</SelectItem>
              <SelectItem value="weekdays">Weekdays</SelectItem>
              <SelectItem value="weekends">Weekends</SelectItem>
              <SelectItem value="evenings">Evenings</SelectItem>
              <SelectItem value="mornings">Mornings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleSearch} className="flex-1 bg-[#8A2BE1] hover:bg-[#5d1a9a]">
            Search Tutors
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setFilters({
                subject: '', location: '', type: '', minRate: 0, maxRate: 100,
                levels: [], rating: 0, availability: '', experience: ''
              })
              router.push('/tutors')
            }}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
