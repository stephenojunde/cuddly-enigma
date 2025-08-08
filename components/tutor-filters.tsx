'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

interface TutorFiltersProps {
  onFiltersChange: (filters: any) => void
}

export default function TutorFilters({ onFiltersChange }: TutorFiltersProps) {
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')
  const [location, setLocation] = useState('')
  const [priceRange, setPriceRange] = useState([0, 100])
  const [experience, setExperience] = useState('')
  const [rating, setRating] = useState('')

  const handleSubjectChange = (value: string) => {
    const safeValue = value || ''
    setSubject(safeValue)
    onFiltersChange({
      subject: safeValue,
      level,
      location,
      priceRange,
      experience,
      rating
    })
  }

  const handleLevelChange = (value: string) => {
    const safeValue = value || ''
    setLevel(safeValue)
    onFiltersChange({
      subject,
      level: safeValue,
      location,
      priceRange,
      experience,
      rating
    })
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const safeValue = e.target.value || ''
    setLocation(safeValue)
    onFiltersChange({
      subject,
      level,
      location: safeValue,
      priceRange,
      experience,
      rating
    })
  }

  const handleExperienceChange = (value: string) => {
    const safeValue = value || ''
    setExperience(safeValue)
    onFiltersChange({
      subject,
      level,
      location,
      priceRange,
      experience: safeValue,
      rating
    })
  }

  const handleRatingChange = (value: string) => {
    const safeValue = value || ''
    setRating(safeValue)
    onFiltersChange({
      subject,
      level,
      location,
      priceRange,
      experience,
      rating: safeValue
    })
  }

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value)
    onFiltersChange({
      subject,
      level,
      location,
      priceRange: value,
      experience,
      rating
    })
  }

  const clearFilters = () => {
    setSubject('')
    setLevel('')
    setLocation('')
    setPriceRange([0, 100])
    setExperience('')
    setRating('')
    onFiltersChange({
      subject: '',
      level: '',
      location: '',
      priceRange: [0, 100],
      experience: '',
      rating: ''
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Filter Tutors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subject} onValueChange={handleSubjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="geography">Geography</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="computer-science">Computer Science</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select value={level} onValueChange={handleLevelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="gcse">GCSE</SelectItem>
                <SelectItem value="a-level">A-Level</SelectItem>
                <SelectItem value="university">University</SelectItem>
                <SelectItem value="adult">Adult Learning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter location"
              value={location}
              onChange={handleLocationChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Select value={experience} onValueChange={handleExperienceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1">0-1 years</SelectItem>
                <SelectItem value="1-3">1-3 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="5-10">5-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Minimum Rating</Label>
            <Select value={rating} onValueChange={handleRatingChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Price Range: £{priceRange[0]} - £{priceRange[1]} per hour</Label>
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
