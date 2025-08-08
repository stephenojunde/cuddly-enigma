import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, ArrowRight, Search } from 'lucide-react'

// Sample blog posts data - in a real app, this would come from your database
const blogPosts = [
  {
    id: '1',
    title: 'How to Choose the Right Tutor for Your Child',
    excerpt: 'Finding the perfect tutor can make all the difference in your child\'s academic journey. Here are the key factors to consider when making this important decision.',
    content: 'When selecting a tutor for your child, it\'s essential to consider their teaching style, qualifications, and compatibility with your child\'s learning needs...',
    author: 'Sarah Johnson',
    authorRole: 'Education Specialist',
    publishedAt: '2024-01-15',
    readTime: '5 min read',
    category: 'Parenting Tips',
    image: '/images/blog/choosing-tutor.jpg',
    featured: true
  },
  {
    id: '2',
    title: 'Top 10 Study Techniques That Actually Work',
    excerpt: 'Discover evidence-based study methods that can help students of all ages improve their learning efficiency and retention.',
    content: 'Effective studying isn\'t just about spending more time with books. It\'s about using proven techniques that maximize learning...',
    author: 'Dr. Michael Chen',
    authorRole: 'Educational Psychologist',
    publishedAt: '2024-01-12',
    readTime: '7 min read',
    category: 'Study Tips',
    image: '/images/blog/study-techniques.jpg',
    featured: true
  },
  {
    id: '3',
    title: 'The Benefits of Online vs In-Person Tutoring',
    excerpt: 'Both online and in-person tutoring have their advantages. Learn which option might be best for your child\'s learning style and circumstances.',
    content: 'The debate between online and in-person tutoring has become more relevant than ever. Each approach offers unique benefits...',
    author: 'Emma Williams',
    authorRole: 'Online Learning Expert',
    publishedAt: '2024-01-10',
    readTime: '6 min read',
    category: 'Education Technology',
    image: '/images/blog/online-vs-inperson.jpg',
    featured: false
  },
  {
    id: '4',
    title: 'Preparing for GCSE Exams: A Complete Guide',
    excerpt: 'A comprehensive guide to help students and parents navigate the GCSE preparation process with confidence and success.',
    content: 'GCSE exams are a crucial milestone in every student\'s academic journey. Proper preparation can make the difference between stress and success...',
    author: 'James Thompson',
    authorRole: 'GCSE Specialist',
    publishedAt: '2024-01-08',
    readTime: '10 min read',
    category: 'Exam Preparation',
    image: '/images/blog/gcse-guide.jpg',
    featured: false
  },
  {
    id: '5',
    title: 'Building Confidence in Mathematics',
    excerpt: 'Many students struggle with math anxiety. Here are proven strategies to help build confidence and improve mathematical understanding.',
    content: 'Mathematics anxiety is real and affects millions of students worldwide. However, with the right approach and support...',
    author: 'Dr. Lisa Parker',
    authorRole: 'Mathematics Education Specialist',
    publishedAt: '2024-01-05',
    readTime: '8 min read',
    category: 'Subject-Specific',
    image: '/images/blog/math-confidence.jpg',
    featured: false
  },
  {
    id: '6',
    title: 'The Role of Parents in Academic Success',
    excerpt: 'Discover how parents can effectively support their children\'s learning journey without becoming overwhelming or intrusive.',
    content: 'Parental involvement in education is crucial, but finding the right balance can be challenging. Here\'s how to support effectively...',
    author: 'Rachel Green',
    authorRole: 'Family Education Consultant',
    publishedAt: '2024-01-03',
    readTime: '6 min read',
    category: 'Parenting Tips',
    image: '/images/blog/parent-role.jpg',
    featured: false
  }
]

const categories = ['All', 'Parenting Tips', 'Study Tips', 'Education Technology', 'Exam Preparation', 'Subject-Specific']

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#8A2BE1] to-[#5d1a9a] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Education Insights & Tips
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Expert advice, study tips, and educational insights to help students and parents succeed
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Articles</h2>
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[#8A2BE1] text-white">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <User className="w-4 h-4 mr-1" />
                    <span className="mr-4">{post.author}</span>
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="mr-4">{new Date(post.publishedAt).toLocaleDateString()}</span>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <Button asChild variant="outline" className="group">
                    <Link href={`/blog/${post.id}`}>
                      Read More
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === 'All' ? 'default' : 'outline'}
                className={category === 'All' ? 'bg-[#8A2BE1] hover:bg-[#7a24d1]' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="mr-3">{new Date(post.publishedAt).toLocaleDateString()}</span>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      <span>{post.author}</span>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="text-[#8A2BE1] hover:text-[#7a24d1]">
                      <Link href={`/blog/${post.id}`}>
                        Read More
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-[#8A2BE1] text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest education tips and insights delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <Button className="bg-white text-[#8A2BE1] hover:bg-gray-100 px-8">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}