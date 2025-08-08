import { TutorApplicationForm } from '@/components/tutor-application-form'

export default function TutorApplicationPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Apply to Become a Tutor</h1>
            <p className="text-lg text-gray-600">
              Join our network of qualified tutors and start making a difference in students' lives
            </p>
          </div>
          <TutorApplicationForm />
        </div>
      </div>
    </main>
  )
}
