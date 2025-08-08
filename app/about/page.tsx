import Image from 'next/image'

export default function AboutPage() {
  return (
    <main>
      {/* Main About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 text-center mb-8 animate-bounce-in">
            TOWARDS A SMART & PASSIONATE GENERATION
          </h1>
          <p className="text-lg md:text-xl text-gray-700 text-center max-w-3xl mx-auto mb-12 animate-fade-in-up stagger-1">
            Welcome to Tutelage Services Ltd.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 animate-fade-in-left">
              <Image 
                src="/images/aboutUs.png" 
                alt="About Us Image" 
                width={600}
                height={400}
                className="rounded-lg shadow-xl w-full object-cover hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-float"
              />
            </div>
            <div className="order-1 lg:order-2 animate-fade-in-right">
              <p className="text-gray-700 text-lg leading-relaxed mb-6 animate-fade-in-up stagger-2">
                At Tutelage Services Ltd., we are dedicated to providing high-quality educational support to schools, teachers, and parents. As a trusted partner in education, we offer a comprehensive range of services designed to enhance learning experiences and ensure schools have access to the skilled professionals they need.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed animate-fade-in-up stagger-3">
                Founded on 7th May 2005, Tutelage Services Ltd. has a rich legacy of educational excellence. Formerly known as Tutelage Educational Services, we have grown and evolved to meet the changing needs of the education sector while staying true to our mission of supporting learners, teachers, and institutions. Over the years, we have provided services to countless schools, trained and placed teachers, supported parents, and offered tuition to students who have gone on to achieve great success in their careers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg h-full flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">1. Recruitment Services</h3>
              <p className="text-gray-700 flex-grow">
                We specialise in educational recruitment, connecting schools with talented, passionate, and reliable teaching professionals. Whether you need day-to-day supply teachers, long-term teaching staff, supervisors, or teaching assistants, we are here to help. Teachers seeking flexible supply roles or permanent positions can also register with us to find rewarding opportunities across various schools.
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg h-full flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">2. Support for Schools</h3>
              <p className="text-gray-700 flex-grow">
                Our experienced team works closely with schools to understand their unique staffing needs, providing tailored recruitment solutions that guarantee continuity and excellence in education.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">3. Support for Parents and Students</h3>
              <p className="text-gray-700">
                Beyond recruitment, we assist parents with educational consultancy and tuition services for students of all ages and backgrounds. Many of our former students are thriving in their chosen careers today, thanks to the strong academic foundation and confidence built through our support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Our Core Principles</h2>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-[#f3eefd] p-10 rounded-xl shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h3>
                <p className="text-lg text-gray-700">
                  To connect exceptional educators with outstanding opportunities, and to empower learners through high-quality tuition, guidance, and mentoring.
                </p>
              </div>
            </div>
            <div className="bg-[#f3eefd] p-10 rounded-xl shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Our Vision</h3>
                <p className="text-lg text-gray-700">
                  To be the leading educational services provider known for professionalism, reliability, and a genuine passion for nurturing lifelong learning.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12 animate-fade-in-up">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center text-center hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-scale-in stagger-1 group">
              <Image src="/images/integrity.jpg" alt="Integrity" width={64} height={64} className="w-16 h-16 mb-4 rounded-full object-cover group-hover:scale-110 transition-transform duration-300 animate-float" />
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#8A2BE1] transition-colors duration-300">Integrity</h3>
              <p className="text-gray-700">We do what we say, with honesty and transparency.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center text-center hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-scale-in stagger-2 group">
              <Image src="/images/exellence.jpg" alt="Excellence" width={64} height={64} className="w-16 h-16 mb-4 rounded-full object-cover group-hover:scale-110 transition-transform duration-300 animate-float" />
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#8A2BE1] transition-colors duration-300">Excellence</h3>
              <p className="text-gray-700">We maintain the highest standards in all our services.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center text-center hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-scale-in stagger-3 group">
              <Image src="/images/commitment.jpg" alt="Commitment" width={64} height={64} className="w-16 h-16 mb-4 rounded-full object-cover group-hover:scale-110 transition-transform duration-300 animate-float" />
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#8A2BE1] transition-colors duration-300">Commitment</h3>
              <p className="text-gray-700">We are dedicated to the success of our clients and communities.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center text-center hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-scale-in stagger-4 group">
              <Image src="/images/collaboration.jpg" alt="Collaboration" width={64} height={64} className="w-16 h-16 mb-4 rounded-full object-cover group-hover:scale-110 transition-transform duration-300 animate-float" />
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#8A2BE1] transition-colors duration-300">Collaboration</h3>
              <p className="text-gray-700">We believe in working together to achieve lasting results.</p>
            </div>
          </div>

          {/* Testimonials */}
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#f3eefd] p-8 rounded-xl shadow-lg">
              <p className="text-xl italic text-gray-700 mb-4">
                "Thanks to Tutelage Services Ltd., we filled our teaching positions quickly with quality educators. Their team is supportive and professional."
              </p>
              <p className="text-lg font-semibold text-gray-800">— Headteacher, London</p>
            </div>
            <div className="bg-[#f3eefd] p-8 rounded-xl shadow-lg">
              <p className="text-xl italic text-gray-700 mb-4">
                "The tuition support transformed my son's confidence. He is now excelling in his A-levels."
              </p>
              <p className="text-lg font-semibold text-gray-800">— Parent, Manchester</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
