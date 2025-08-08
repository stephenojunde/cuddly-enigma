import { ContactForm } from '@/components/contact-form'

export default function ContactPage() {
  return (
    <main>
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-extrabold text-gray-900 text-center mb-8">Get in Touch</h1>
          <p className="text-xl text-gray-700 text-center max-w-3xl mx-auto mb-12">
            We're here to help! Reach out to us with any questions or inquiries.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Contact Information</h2>
              <ul className="text-gray-700 space-y-3">
                <li><strong>Address:</strong> 850 Cleckheaton Road Oakenshaw, Bradford. BD12 7AA</li>
                <li><strong>Phone:</strong> +442036756199, +447503567466, +2348062798151</li>
                <li><strong>Email:</strong> info.badru@tutelageservices.co.uk</li>
              </ul>
              <div className="mt-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Find Us on the Map</h2>
                <div className="bg-gray-200 h-64 rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="Location map showing 850 Cleckheaton Road Oakenshaw, Bradford. BD12 7AA"
                    src="https://maps.google.com/maps?q=850%20Cleckheaton%20Road%20Oakenshaw%2C%20Bradford.%20BD12%207AA&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Send Us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
