import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { safeString, safeNumber } from '@/lib/utils'

export default async function JobsPage() {
  const supabase = await createClient()
  
  // Fetch active jobs with school information
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      schools (
        name,
        location
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 text-center mb-8">
            Tutelage Learning Support Services
          </h1>
          <p className="text-lg md:text-xl text-gray-700 text-center max-w-4xl mx-auto mb-12">
            At Tutelage Service Limited, we believe every child deserves the opportunity to learn, grow, and achieve their fullest potential. Our Tutelage Learning Support Services are designed to uphold the principles of inclusion and equity, ensuring that no learner is left behind.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Image 
                src="/images/job.png" 
                alt="Learning Support" 
                width={600}
                height={400}
                className="rounded-lg shadow-xl w-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Our Approach</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                We are passionate about creating supportive, nurturing environments for students who need extra help, including those with special educational needs and disabilities (SEND). Our dedicated team of certified SEND teachers and support staff are trained to deliver individualized, high-quality educational experiences that empower every learner to thrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Job Openings */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">Current Job Openings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => {
                const jobTitle = safeString(job?.title, 'Job Title Not Available')
                const schoolName = safeString(job?.schools?.name, 'School Name Not Available')
                const jobLocation = safeString(job?.location, 'Location Not Specified')
                const contractType = safeString(job?.contract_type, 'Contract Type Not Specified')
                const subject = safeString(job?.subject)
                const description = safeString(job?.description, 'No description available')
                const salaryMin = safeNumber(job?.salary_min)
                const salaryMax = safeNumber(job?.salary_max)

                return (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{jobTitle}</CardTitle>
                      <CardDescription>
                        {schoolName} • {jobLocation}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <Badge variant="secondary" className="capitalize">
                          {contractType}
                        </Badge>
                        {subject && (
                          <Badge variant="outline">{subject}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {description}
                      </p>
                      {salaryMin > 0 && salaryMax > 0 && (
                        <p className="text-sm font-medium text-gray-800 mb-2">
                          £{salaryMin.toLocaleString()} - £{salaryMax.toLocaleString()}
                        </p>
                      )}
                      <Link 
                        href={`/jobs/${job.id}`}
                        className="text-[#8A2BE1] hover:text-[#5d1a9a] text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No job openings available at the moment.</p>
              </div>
            )}
          </div>
          <div className="mt-12 text-center">
            <Link href="/jobs/all" className="bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-3 px-8 rounded-full text-lg transition-all hover:scale-105">
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">Why Choose Tutelage Learning Support?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg h-full flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Specialized SEND Teachers</h3>
              <p className="text-gray-700 flex-grow">
                Our SEND specialists are qualified, experienced, and equipped with the skills to address a wide range of learning difficulties and additional needs, providing targeted strategies that promote progress and build confidence.
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg h-full flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Personalized Learning Support</h3>
              <p className="text-gray-700 flex-grow">
                We tailor our support to the unique abilities and goals of each learner, developing customized plans that remove barriers and encourage growth academically, socially, and emotionally.
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg h-full flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Learning Centers and Learning Homes</h3>
              <p className="text-gray-700 flex-grow">
                We aim to establish dedicated learning centers and home-based programs for children with special needs, creating safe, inclusive spaces where they can receive the best of support and care to become the best version of themselves.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Commitment to Inclusion</h3>
              <p className="text-gray-700">
                At Tutelage, inclusion is not just a word — it is our mission. We partner with families, caregivers, and schools to create holistic support systems that ensure every child feels valued, respected, and capable of success.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Proven Results</h3>
              <p className="text-gray-700">
                Our results speak for themselves: countless students have achieved higher grades, improved confidence, and greater academic success thanks to the tailored guidance of Tutelage Private Tuition.
              </p>
            </div>
          </div>
          <div className="mt-16 text-center">
            <Link href="/jobs/apply" className="bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-3 px-8 rounded-full text-lg transition-all hover:scale-105">
              Find a Role
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
