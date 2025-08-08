export default function WhyUsPage() {
  const reasons = [
    {
      title: "Comprehensive Educational Solutions",
      description: "We offer a one-stop solution for all your teaching needs, from providing supply teachers and cover supervisors to recruiting and interviewing qualified teachers for schools and private homes."
    },
    {
      title: "Qualified, Trusted Professionals", 
      description: "Our team consists of thoroughly vetted and highly qualified educators who deliver quality instruction and a positive impact wherever they work."
    },
    {
      title: "Tailored Learning Support",
      description: "Through our Tutelage Learning Support, we extend bespoke, student-centered support to learners who need extra guidance and encouragement beyond the classroom."
    },
    {
      title: "Exam Preparation Expertise",
      description: "We provide robust support for students preparing for critical examinations, including GCSE, WASSCE, UTME, A-Levels, SAT, TOEFL, IELTS, GMAT, and other professional and academic tests, covering primary, secondary, and post-secondary levels. Our dedicated tutors help learners build confidence and achieve exam success."
    },
    {
      title: "Flexible and Reliable Staffing",
      description: "Schools can rely on us for prompt, efficient, and reliable placement of temporary or long-term teaching staff, ensuring minimal disruption to learning."
    },
    {
      title: "Proven Track Record",
      description: "With years of experience, we have successfully connected countless educators with schools and families, supporting academic excellence and student progress."
    }
  ]

  return (
    <main>
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-12">Why Choose Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reasons.map((reason, index) => (
              <div 
                key={index}
                className="bg-[#ddcdfb] rounded-lg shadow-md p-6 transition-all hover:shadow-lg hover:scale-105"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-3">{reason.title}</h3>
                <p className="text-gray-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
