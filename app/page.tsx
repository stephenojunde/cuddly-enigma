import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Users, BookOpen, Award, CheckCircle, ArrowRight } from 'lucide-react'

export default function HomePage() {
  // Static data to avoid any database-related errors
  const featuredTutors = [
    {
      id: '1',
      name: 'Sarah Johnson',
      subjects: ['Mathematics', 'Physics'],
      rating: 4.9,
      reviews: 127,
      hourly_rate: 35,
      avatar_url: '/images/placeholder-avatar.svg'
    },
    {
      id: '2', 
      name: 'Michael Chen',
      subjects: ['English Literature', 'History'],
      rating: 4.8,
      reviews: 89,
      hourly_rate: 30,
      avatar_url: '/images/placeholder-avatar.svg'
    },
    {
      id: '3',
      name: 'Emma Williams',
      subjects: ['Chemistry', 'Biology'],
      rating: 4.9,
      reviews: 156,
      hourly_rate: 40,
      avatar_url: '/images/placeholder-avatar.svg'
    }
  ]

  const stats = [
    { icon: Users, label: 'Active Tutors', value: '2,500+' },
    { icon: BookOpen, label: 'Subjects Covered', value: '50+' },
    { icon: Award, label: 'Success Rate', value: '98%' },
    { icon: Star, label: 'Average Rating', value: '4.9' }
  ]

  const features = [
    {
      title: 'Verified Tutors',
      description: 'All our tutors are thoroughly vetted and qualified professionals.',
      icon: CheckCircle
    },
    {
      title: 'Flexible Scheduling',
      description: 'Book sessions that fit your schedule, online or in-person.',
      icon: BookOpen
    },
    {
      title: 'Personalized Learning',
      description: 'Tailored lessons designed to meet each student\'s unique needs.',
      icon: Users
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
                Find the Perfect Tutor for Your Child
              </h1>
              <p className="text-xl mb-8 opacity-90 animate-fade-in-up stagger-1">
                Connect with qualified, experienced tutors who are passionate about helping students succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-2">
                <Button asChild size="lg" className="bg-white text-[#8A2BE1] hover:bg-gray-100 hover:scale-105 transition-all duration-300 animate-pulse-glow">
                  <Link href="/tutors">Find a Tutor</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#8A2BE1] hover:scale-105 transition-all duration-300">
                  <Link href="/apply/tutor">Become a Tutor</Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 animate-fade-in-right animate-float">
              <Image
                src="/images/homepage.png"
                alt="Students learning with tutors"
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
              Meet Our Top Tutors
            </h2>
            <p className="text-lg text-gray-600">
              Discover some of our highest-rated tutors ready to help your child succeed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredTutors.map((tutor, index) => (
              <Card 
                key={tutor.id} 
                className={`hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-scale-in stagger-${index + 1} group cursor-pointer`}
              >
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Image
                      src={tutor.avatar_url || "/images/placeholder-avatar.svg"}
                      alt={`${tutor.name} profile`}
                      width={80}
                      height={80}
                      className="rounded-full mx-auto transition-all duration-300 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder-avatar.svg';
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-[#8A2BE1] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#8A2BE1] transition-colors duration-300">{tutor.name}</h3>
                  <div className="flex flex-wrap justify-center gap-2 mb-3">
                    {tutor.subjects.map((subject, index) => (
                      <Badge 
                        key={index} 
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
                      {tutor.rating} ({tutor.reviews} reviews)
                    </span>
                  </div>
                  <p className="text-lg font-bold text-[#8A2BE1] group-hover:scale-110 transition-transform duration-300">
                    £{tutor.hourly_rate}/hour
                  </p>
                </CardContent>
              </Card>
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
              Why Choose Tutelage?
            </h2>
            <p className="text-lg text-gray-600">
              We're committed to providing the best tutoring experience for students and families.
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8A2BE1] via-[#7a24d1] to-[#8A2BE1] text-white animate-gradient overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 animate-bounce-in">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 opacity-90 animate-fade-in-up stagger-1">
            Join thousands of students who have improved their grades with our expert tutors.
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
