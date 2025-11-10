'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

interface TeacherCardProps {
  tutor: {
    id: string
    name: string
    subjects: string[]
    rating: number
    total_reviews: number
    hourly_rate: number
    avatar_url?: string
  }
  index: number
}

export function TeacherCard({ tutor, index }: TeacherCardProps) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const imageSrc = imgError ? "/images/placeholder-avatar.svg" : (tutor.avatar_url || "/images/placeholder-avatar.svg")

  return (
    <Card 
      className={`hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-scale-in stagger-${index + 1} group cursor-pointer`}
    >
      <CardContent className="p-6 text-center">
        <div className="relative mb-4">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#8A2BE1] shadow-lg group-hover:border-[#5d1a9a] transition-all duration-300 bg-gray-100 flex items-center justify-center">
            {!imgLoaded && !imgError && (
              <div className="text-gray-400 text-xs">Loading...</div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={`${tutor.name} - Supply Teacher`}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => {
                setImgLoaded(true)
                console.log(`✅ Image loaded successfully for ${tutor.name}:`, imageSrc)
              }}
              onError={(e) => {
                console.error(`❌ Image failed to load for ${tutor.name}:`, imageSrc)
                setImgError(true)
                setImgLoaded(true)
              }}
            />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#8A2BE1] transition-colors duration-300">
          {tutor.name}
        </h3>
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {Array.isArray(tutor.subjects) && tutor.subjects.map((subject, idx) => (
            <Badge 
              key={idx} 
              variant="secondary"
              className="hover:bg-[#8A2BE1] hover:text-white transition-all duration-300"
            >
              {subject}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-center mb-3">
          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1 animate-pulse" />
          <span className="text-sm text-gray-600">
            {tutor.rating || 0} ({tutor.total_reviews || 0} reviews)
          </span>
        </div>
        <p className="text-lg font-bold text-[#8A2BE1] group-hover:scale-110 transition-transform duration-300">
          £{tutor.hourly_rate || 0}/day
        </p>
      </CardContent>
    </Card>
  )
}
