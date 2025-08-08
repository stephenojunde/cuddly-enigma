'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-[#330a59] shadow-md fixed top-0 left-0 w-full z-50">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            <Link href="/">
              <Image 
                src="/images/logo 1.png" 
                alt="Tutelage Services Logo" 
                width={120} 
                height={32} 
                className="h-8 w-auto" 
                priority
              />
            </Link>
          </div>
          
          <div className="hidden md:block">
            <ul className="flex items-center space-x-8">
              <li><Link href="/schools" className="text-white hover:text-[#bf9df6] transition-colors">Schools</Link></li>
              <li><Link href="/jobs" className="text-white hover:text-[#bf9df6] transition-colors">Jobs</Link></li>
              <li><Link href="/parents" className="text-white hover:text-[#bf9df6] transition-colors">Parents</Link></li>
              <li><Link href="/blog" className="text-white hover:text-[#bf9df6] transition-colors">Blog</Link></li>
              <li><Link href="/about" className="text-white hover:text-[#bf9df6] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-white hover:text-[#bf9df6] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div className="hidden md:block">
            <Link href="/login" className="text-white hover:text-[#bf9df6] mr-4 transition-colors">Login</Link>
            <Link href="/signup" className="bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-2 px-4 rounded-full transition-all hover:scale-105">
              Sign Up
            </Link>
          </div>
          
          <div className="md:hidden">
            <button 
              className="outline-none text-white"
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
          <ul className="space-y-4">
            <li><Link href="/schools" className="block px-4 py-2 text-white hover:text-[#bf9df6]">Schools</Link></li>
            <li><Link href="/jobs" className="block px-4 py-2 text-white hover:text-[#bf9df6]">Jobs</Link></li>
            <li><Link href="/parents" className="block px-4 py-2 text-white hover:text-[#bf9df6]">Parents</Link></li>
            <li><Link href="/blog" className="block px-4 py-2 text-white hover:text-[#bf9df6]">Blog</Link></li>
            <li><Link href="/about" className="block px-4 py-2 text-white hover:text-[#bf9df6]">About Us</Link></li>
            <li><Link href="/contact" className="block px-4 py-2 text-white hover:text-[#bf9df6]">Contact Us</Link></li>
            <li className="mt-4">
              <Link href="/login" className="block w-full text-center py-2 px-4 text-white bg-[#8A2BE1] rounded-full hover:bg-[#5d1a9a]">
                Login
              </Link>
            </li>
            <li>
              <Link href="/signup" className="block w-full text-center py-2 px-4 text-white bg-transparent border border-white rounded-full hover:bg-white hover:text-[#330a59]">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
