import { createClient } from '@/lib/server'
import { Star } from 'lucide-react'
import { safeString, safeNumber } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function TestimonialsPage() {
  const supabase = await createClient()
  
  // Fetch approved testimonials
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  return (
    <main>
      <section className="bg-[#f3eefd] py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">What Our Clients Say</h1>
          <p className="text-lg text-gray-600 text-center mb-12">
            Hear from parents, schools, and tutors who have experienced the Tutelage Services difference.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials && testimonials.length > 0 ? (
              testimonials.map((testimonial, index) => {
                const testimonialName = safeString(testimonial?.name, 'Anonymous')
                const testimonialRole = safeString(testimonial?.role, 'Client')
                const testimonialLocation = safeString(testimonial?.location)
                const testimonialContent = safeString(testimonial?.content, 'No testimonial content available')
                const testimonialRating = safeNumber(testimonial?.rating, 5)

                return (
                  <div 
                    key={testimonial.id || index} 
                    className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg hover:scale-105"
                  >
                    <div className="flex items-center mb-4">
                      {[...Array(Math.min(Math.max(testimonialRating, 1), 5))].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4">"{testimonialContent}"</p>
                    <div className="border-t pt-4">
                      <p className="text-gray-800 font-bold">{testimonialName}</p>
                      <p className="text-gray-600 text-sm">{testimonialRole}</p>
                      {testimonialLocation && (
                        <p className="text-gray-500 text-sm">{testimonialLocation}</p>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No testimonials available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
