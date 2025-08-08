import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/server'
import { safeString } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function SchoolsPage() {
  const supabase = await createClient()
  
  // Fetch partner schools
  const { data: schools } = await supabase
    .from('schools')
    .select('*')
    .eq('is_partner', true)
    .limit(6)

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-extrabold text-gray-900 text-center mb-8">
            Tutelage School Teachers
          </h1>
          <p className="text-xl text-gray-700 text-center max-w-3xl mx-auto mb-12">
            At Tutelage Service Limited, our Tutelage School Teachers program is designed to bridge the gap between educational institutions seeking outstanding educators and talented professionals eager to make an impact.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <Image 
                src="/images/schools.png" 
                alt="Teacher Recruitment" 
                width={600}
                height={400}
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Teacher Recruitment & Job Placement</h2>
              <p className="text-gray-700 mb-4">We recruit and place a wide range of teaching professionals, including:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-3">
                <li>Early-career teachers (Newly Qualified Teachers / Early Career Teachers)</li>
                <li>Experienced teachers</li>
                <li>Teaching assistants</li>
                <li>Unqualified teachers</li>
                <li>Qualified teachers (QTS-certified or equivalent)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We actively connect these professionals with schools in need of temporary, long-term, or permanent staff, ensuring an excellent match that supports educational achievement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Schools */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Our Partner Schools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schools && schools.length > 0 ? (
              schools.map((school) => {
                const schoolName = safeString(school?.name, 'School Name Not Available')
                const schoolAddress = safeString(school?.address, 'Address Not Available')
                const schoolType = safeString(school?.school_type, 'Type Not Specified')
                const schoolDescription = safeString(school?.description, 'No description available')
                const schoolWebsite = safeString(school?.website)

                return (
                  <div key={school.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{schoolName}</h3>
                    <p className="text-gray-600 mb-2">{schoolAddress}</p>
                    <p className="text-gray-600 mb-2 capitalize">{schoolType} School</p>
                    <p className="text-gray-700 text-sm">{schoolDescription}</p>
                    {schoolWebsite && (
                      <a 
                        href={schoolWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#8A2BE1] hover:text-[#5d1a9a] text-sm mt-2 inline-block"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No partner schools available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Supply Teacher Services</h3>
              <p className="text-gray-700">
                Educational institutions can rely on us for prompt, dependable supply teachers and cover supervisors. We pride ourselves on responding quickly to requests, ensuring smooth continuity of learning with minimal disruption.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">In-House Recruitment & Training</h3>
              <p className="text-gray-700">
                We partner with schools to deliver in-house recruitment and staff training solutions, supporting them in building robust teaching capacity and nurturing professional growth.
              </p>
            </div>
          </div>
          <div className="mt-16 text-center">
            <Link href="/contact" className="bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-3 px-8 rounded-full text-lg transition-all hover:scale-105">
              Request a Callback
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
