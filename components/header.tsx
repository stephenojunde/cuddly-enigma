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
    <header className="bg-[#330a59] shadow-md fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-opacity-95 transition-all duration-300">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-white animate-fade-in-left">
            <Link href="/" className="hover:scale-105 transition-transform duration-300">
              <Image 
                src="/images/logo 1.png" 
                alt="Tutelage Services Logo" 
                width={120} 
                height={32} 
                className="h-8 w-auto hover:brightness-110 transition-all duration-300" 
                priority
              />
            </Link>
          </div>
          
          <div className="hidden md:block animate-fade-in-up">
            <ul className="flex items-center space-x-8">
              <li><Link href="/schools" className="text-white hover:text-[#bf9df6] transition-all duration-300 hover:scale-110 relative group">
                Schools
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#bf9df6] transition-all duration-300 group-hover:w-full"></span>
              </Link></li>
              <li><Link href="/jobs" className="text-white hover:text-[#bf9df6] transition-all duration-300 hover:scale-110 relative group">
                Jobs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#bf9df6] transition-all duration-300 group-hover:w-full"></span>
              </Link></li>
              <li><Link href="/parents" className="text-white hover:text-[#bf9df6] transition-all duration-300 hover:scale-110 relative group">
                Parents
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#bf9df6] transition-all duration-300 group-hover:w-full"></span>
              </Link></li>
              <li><Link href="/blog" className="text-white hover:text-[#bf9df6] transition-all duration-300 hover:scale-110 relative group">
                Blog
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#bf9df6] transition-all duration-300 group-hover:w-full"></span>
              </Link></li>
              <li><Link href="/about" className="text-white hover:text-[#bf9df6] transition-all duration-300 hover:scale-110 relative group">
                About Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#bf9df6] transition-all duration-300 group-hover:w-full"></span>
              </Link></li>
              <li><Link href="/contact" className="text-white hover:text-[#bf9df6] transition-all duration-300 hover:scale-110 relative group">
                Contact Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#bf9df6] transition-all duration-300 group-hover:w-full"></span>
              </Link></li>
            </ul>
          </div>
          
          <div className="hidden md:block animate-fade-in-right">
            <Link href="/login" className="text-white hover:text-[#bf9df6] mr-4 transition-all duration-300 hover:scale-110">Login</Link>
            <Link href="/signup" className="bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-2 px-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg animate-pulse-glow mr-2">
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
        
        <div className={`${isMenuOpen ? 'block animate-slide-in-bottom' : 'hidden'} md:hidden mt-4`}>
          <ul className="space-y-4">
            <li className="animate-fade-in-up stagger-1"><Link href="/schools" className="block px-4 py-2 text-white hover:text-[#bf9df6] transition-all duration-300 hover:translate-x-2">Schools</Link></li>
            <li className="animate-fade-in-up stagger-2"><Link href="/jobs" className="block px-4 py-2 text-white hover:text-[#bf9df6] transition-all duration-300 hover:translate-x-2">Jobs</Link></li>
            <li className="animate-fade-in-up stagger-3"><Link href="/parents" className="block px-4 py-2 text-white hover:text-[#bf9df6] transition-all duration-300 hover:translate-x-2">Parents</Link></li>
            <li className="animate-fade-in-up stagger-4"><Link href="/blog" className="block px-4 py-2 text-white hover:text-[#bf9df6] transition-all duration-300 hover:translate-x-2">Blog</Link></li>
            <li className="animate-fade-in-up stagger-5"><Link href="/about" className="block px-4 py-2 text-white hover:text-[#bf9df6] transition-all duration-300 hover:translate-x-2">About Us</Link></li>
            <li className="animate-fade-in-up stagger-6"><Link href="/contact" className="block px-4 py-2 text-white hover:text-[#bf9df6] transition-all duration-300 hover:translate-x-2">Contact Us</Link></li>
            <li className="mt-4 animate-scale-in">
              <Link href="/login" className="block w-full text-center py-2 px-4 text-white bg-[#8A2BE1] rounded-full hover:bg-[#5d1a9a] transition-all duration-300 hover:scale-105">
                Login
              </Link>
            </li>
            <li className="animate-scale-in stagger-1">
              <Link href="/signup" className="block w-full text-center py-2 px-4 text-white bg-transparent border border-white rounded-full hover:bg-white hover:text-[#330a59] transition-all duration-300 hover:scale-105">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
