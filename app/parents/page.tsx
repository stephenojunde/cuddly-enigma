import Image from 'next/image'
import Link from 'next/link'

export default function ParentsPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-12">
            Private Tuition Services
          </h1>
          
          {/* In-Home Tuition Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
            <div className="order-2 lg:order-1">
              <Image 
                src="/images/parent.png" 
                alt="In-Home Tuition" 
                width={600}
                height={400}
                className="rounded-lg shadow-xl w-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">In-Home Tuition</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Our qualified, experienced teachers come directly to your home to provide one-on-one support tailored to your child's unique needs. This face-to-face approach ensures close attention, personalized strategies, and a supportive environment where learners thrive.
              </p>
            </div>
          </div>
          
          {/* Virtual Tuition Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Virtual Tuition</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Our online tutors are skilled at delivering dynamic, interactive learning experiences through secure digital platforms. From anywhere in the world, your child can connect with a professional tutor who knows how to engage, motivate, and inspire academic excellence.
              </p>
            </div>
            <div className="order-2">
              <Image 
                src="/images/collaboration.jpg" 
                alt="Virtual Tuition" 
                width={600}
                height={400}
                className="rounded-lg shadow-xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg h-full flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">High-Quality, Professional Tutors</h3>
              <p className="text-gray-700 flex-grow">
                Our team includes qualified, experienced, and carefully vetted educators who bring subject mastery and a proven ability to connect with learners, whether virtually or in person.
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg h-full flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Comprehensive Subject Coverage</h3>
              <p className="text-gray-700 flex-grow">
                We offer tuition across all subjects and levels, including core subjects such as Mathematics, English, and Science, as well as languages, humanities, arts, and more.
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg h-full flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Exam Preparation</h3>
              <p className="text-gray-700 flex-grow">
                Through our private tuition program, we have successfully supported hundreds of thousands of students preparing for key examinations — GCSE, A-Levels, UTME, SAT, TOEFL, IELTS, GMAT, and a wide range of professional certifications.
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg h-full flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Flexible and Convenient</h3>
              <p className="text-gray-700 flex-grow">
                Learning takes place at your convenience, whether in person or online, with flexible scheduling to fit seamlessly into your family's lifestyle.
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg h-full flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Proven Impact</h3>
              <p className="text-gray-700 flex-grow">
                Our results speak for themselves: countless students have achieved higher grades, improved confidence, and greater academic success thanks to the tailored guidance of Tutelage Private Tuition.
              </p>
            </div>
          </div>
          <div className="mt-16 text-center">
            <Link href="/tutors" className="bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-3 px-8 rounded-full text-lg transition-all hover:scale-105 mr-4">
              Find a Tutor
            </Link>
            <Link href="/contact" className="bg-transparent border-2 border-[#8A2BE1] text-[#8A2BE1] hover:bg-[#8A2BE1] hover:text-white font-bold py-3 px-8 rounded-full text-lg transition-all hover:scale-105">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
