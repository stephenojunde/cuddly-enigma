import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-[#330a59] py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="group">
              <h3 className="text-lg font-bold text-white flex items-center group-hover:text-gray-200 transition-colors">
                <Image src="/images/logo 2.png" alt="Tutelage Services Logo" width={24} height={24} className="h-6 w-6 mr-2" />
                Tutelage Services
              </h3>
            </Link>
            <p className="text-gray-400 mt-2">
              We are a leading education recruitment agency, helping teachers and support staff find their next role in schools across the UK.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white">Quick Links</h3>
            <ul className="mt-2 space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/schools" className="text-gray-400 hover:text-white transition-colors">Schools</Link></li>
              <li><Link href="/jobs" className="text-gray-400 hover:text-white transition-colors">Jobs</Link></li>
              <li><Link href="/parents" className="text-gray-400 hover:text-white transition-colors">Parents</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/why-us" className="text-gray-400 hover:text-white transition-colors">Why Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/compliance" className="text-gray-400 hover:text-white transition-colors">Compliance</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white">Follow Us</h3>
            <ul className="mt-2 space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a></li>
            </ul>
            
            <div className="mt-4">
              <h3 className="text-lg font-bold text-white">Contact Us</h3>
              <ul className="mt-2 space-y-2">
                <li className="text-gray-400">850 Cleckheaton Road Oakenshaw, Bradford. BD12 7AA</li>
                <li className="text-gray-400">+442036756199, +447503567466, +2348062798151</li>
                <li className="text-gray-400">info.badru@tutelageservices.co.uk</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-6">
          <p className="text-center text-gray-400">&copy; 2025 Tutelage Services. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
