import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Star, Users, BookOpen, Award, CheckCircle, ArrowRight, Shield, Clock, FileCheck, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/server'
import { TeacherCard } from '@/components/teacher-card'

// Force dynamic rendering since we use cookies for Supabase
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Fetch featured tutors from database
  // Note: Temporarily disabled to use fallback data with images
  // const { data: featuredTutors } = await supabase
  //   .from('tutors')
  //   .select('id, name, subjects, rating, total_reviews, hourly_rate, avatar_url')
  //   .eq('is_featured', true)
  //   .eq('is_active', true)
  //   .limit(3)
  const featuredTutors: Array<{id: string, name: string, subjects: string[], rating: number, total_reviews: number, hourly_rate: number, avatar_url?: string}> = [] // Force use of fallback data with images

  // Calculate real statistics
  const [
    { count: activeTutorsCount },
    { count: subjectsCount },
    { count: completedBookings },
    { count: totalBookings },
    { data: ratingsData }
  ] = await Promise.all([
    // Active tutors count
    supabase
      .from('tutors')
      .select('id', { count: 'exact' })
      .eq('is_active', true),
    
    // Subjects count
    supabase
      .from('subjects')
      .select('id', { count: 'exact' })
      .eq('is_active', true),
    
    // Completed bookings
    supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('status', 'completed'),
    
    // Total bookings
    supabase
      .from('bookings')
      .select('id', { count: 'exact' }),
    
    // Average rating data
    supabase
      .from('tutors')
      .select('rating')
      .not('rating', 'is', null)
      .gt('rating', 0)
  ])

  // Calculate success rate
  const successRate = (totalBookings && completedBookings && totalBookings > 0) 
    ? Math.round((completedBookings / totalBookings) * 100) 
    : 0
  
  // Calculate average rating
  const avgRating = ratingsData && ratingsData.length > 0 
    ? (ratingsData.reduce((sum, t) => sum + t.rating, 0) / ratingsData.length).toFixed(1)
    : '0.0'

  // Prepare stats with real data
  const stats = [
    { 
      icon: Users, 
      label: 'Supply Teachers', 
      value: activeTutorsCount && activeTutorsCount > 0 ? `${activeTutorsCount}+` : '150+' 
    },
    { 
      icon: BookOpen, 
      label: 'Schools Served', 
      value: subjectsCount && subjectsCount > 0 ? `${subjectsCount}+` : '50+' 
    },
    { 
      icon: Award, 
      label: 'Placement Success', 
      value: `${successRate > 0 ? successRate : 98}%` 
    },
    { 
      icon: Star, 
      label: 'Average Rating', 
      value: avgRating !== '0.0' ? avgRating : '4.8' 
    }
  ]

  // Fallback featured supply teachers if none in database
  const displayFeaturedTutors = featuredTutors && featuredTutors.length > 0 ? featuredTutors : [
    {
      id: 'sample-1',
      name: 'Sarah Johnson',
      subjects: ['Mathematics', 'Physics', 'KS3-KS4'],
      rating: 4.9,
      total_reviews: 67,
      hourly_rate: 180,
      avatar_url: '/images/SarahJohnson.jpg'
    },
    {
      id: 'sample-2', 
      name: 'Michael Chen',
      subjects: ['English', 'History', 'KS2-KS3'],
      rating: 4.8,
      total_reviews: 89,
      hourly_rate: 165,
      avatar_url: '/images/MichaelChen.jpg'
    },
    {
      id: 'sample-3',
      name: 'Emma Williams',
      subjects: ['Science', 'Chemistry', 'Biology'],
      rating: 5.0,
      total_reviews: 52,
      hourly_rate: 195,
      avatar_url: '/images/EmmaWilliams.jpg'
    }
  ]

  const features = [
    {
      title: 'DBS Verified Teachers',
      description: 'All our supply teachers are thoroughly vetted with enhanced DBS checks and qualified professionals.',
      icon: CheckCircle
    },
    {
      title: 'Rapid Response',
      description: 'Quick placement of supply teachers and cover supervisors to minimize disruption.',
      icon: Clock
    },
    {
      title: 'Quality Assurance',
      description: 'Experienced teachers who maintain continuity of learning and classroom standards.',
      icon: Shield
    }
  ]

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#8A2BE1] via-[#7a24d1] to-[#5d1a9a] text-white py-20 animate-gradient overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-10 lg:mb-0 animate-fade-in-left">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
                Leading Education Recruitment Agency
              </h1>
              <p className="text-xl mb-8 opacity-90 animate-fade-in-up stagger-1">
                Prompt, dependable supply teachers and cover supervisors. We respond quickly to ensure smooth continuity of learning with minimal disruption.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-2">
                <Button asChild size="lg" className="bg-white text-[#8A2BE1] hover:bg-gray-100 hover:scale-105 transition-all duration-300 animate-pulse-glow">
                  <Link href="/tutors">Find Supply Teachers</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#8A2BE1] hover:scale-105 transition-all duration-300">
                  <Link href="/apply/tutor">Join Our Team</Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 animate-fade-in-right animate-float">
              <Image
                src="/images/homepage.png"
                alt="Supply teachers in educational institutions"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center animate-bounce-in hover:scale-110 transition-all duration-300 cursor-pointer stagger-${index + 1}`}
              >
                <stat.icon className="w-12 h-12 text-[#8A2BE1] mx-auto mb-4 animate-float" />
                <div className="text-3xl font-bold text-gray-800 mb-2 hover:text-[#8A2BE1] transition-colors duration-300">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Meet Our Supply Teachers
            </h2>
            <p className="text-lg text-gray-600">
              Discover our qualified supply teachers and cover supervisors ready to support your school.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {displayFeaturedTutors.map((tutor, index) => (
              <TeacherCard key={tutor.id} tutor={tutor} index={index} />
            ))}
          </div>
          
          <div className="text-center animate-slide-in-bottom">
            <Button asChild size="lg" className="hover:scale-105 transition-all duration-300 animate-pulse-glow">
              <Link href="/tutors">
                View All Tutors <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Why Choose Tutelage Services?
            </h2>
            <p className="text-lg text-gray-600">
              We&apos;re committed to providing prompt, dependable supply teaching services for educational institutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`text-center group hover:scale-105 transition-all duration-500 animate-fade-in-up stagger-${index + 1} cursor-pointer p-6 rounded-lg hover:bg-white hover:shadow-xl`}
              >
                <feature.icon className="w-16 h-16 text-[#8A2BE1] mx-auto mb-6 group-hover:scale-110 transition-all duration-300 animate-float" />
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-[#8A2BE1] transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DBS Safety Section */}
      <section className="py-20 bg-white border-t">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="flex justify-center mb-4">
              <Shield className="w-16 h-16 text-[#8A2BE1] animate-float" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Safeguarding is Our Priority
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              All our supply teachers and cover supervisors undergo comprehensive DBS (Disclosure and Barring Service) background checks 
              to ensure the highest standards of child safety and protection in educational settings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="text-center group hover:scale-105 transition-all duration-300 p-6 rounded-lg hover:bg-gray-50">
              <UserCheck className="w-12 h-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-all duration-300" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Enhanced DBS Verified</h3>
              <p className="text-gray-600 text-sm">All supply teachers have current Enhanced DBS certificates for working in schools</p>
            </div>
            
            <div className="text-center group hover:scale-105 transition-all duration-300 p-6 rounded-lg hover:bg-gray-50">
              <FileCheck className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-all duration-300" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Admin Verified</h3>
              <p className="text-gray-600 text-sm">Our team manually reviews and verifies every DBS certificate</p>
            </div>
            
            <div className="text-center group hover:scale-105 transition-all duration-300 p-6 rounded-lg hover:bg-gray-50">
              <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4 group-hover:scale-110 transition-all duration-300" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Regular Renewals</h3>
              <p className="text-gray-600 text-sm">We track renewal dates and ensure all certificates stay current</p>
            </div>
            
            <div className="text-center group hover:scale-105 transition-all duration-300 p-6 rounded-lg hover:bg-gray-50">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-all duration-300" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Transparent Status</h3>
              <p className="text-gray-600 text-sm">See each supply teacher&apos;s DBS verification status clearly displayed on their profile</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">What This Means for You</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    For Schools
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Complete peace of mind when booking supply teachers</li>
                    <li>• Easy identification of verified teachers with green badges</li>
                    <li>• Transparent access to verification dates and status</li>
                    <li>• Confidence in our commitment to safeguarding</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    For Supply Teachers
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Stand out with verified professional credentials</li>
                    <li>• Free DBS verification service on our platform</li>
                    <li>• Automatic renewal reminders every 3 years</li>
                    <li>• Attract more placements with verified status</li>
                  </ul>
                </div>
              </div>
              <div className="text-center mt-8">
                <p className="text-gray-600 mb-4">
                  <strong>Remember:</strong> DBS verification is completely free on our platform and helps create a safer learning environment for everyone! 🛡️
                </p>
                <Button asChild className="hover:scale-105 transition-all duration-300">
                  <Link href="/tutors">Browse Verified Supply Teachers</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8A2BE1] via-[#7a24d1] to-[#8A2BE1] text-white animate-gradient overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 animate-bounce-in">
            Need Supply Teachers?
          </h2>
          <p className="text-xl mb-8 opacity-90 animate-fade-in-up stagger-1">
            Join hundreds of schools who trust us for prompt, dependable supply teaching services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-bottom">
            <Button asChild size="lg" className="bg-white text-[#8A2BE1] hover:bg-gray-100 hover:scale-110 transition-all duration-300 animate-pulse-glow">
              <Link href="/signup">Get Started Today</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#8A2BE1] hover:scale-110 transition-all duration-300">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
