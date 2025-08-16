'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Open dashboard in new tab
    window.open('/dashboard', '_blank')
    
    // Redirect current tab to home page after a short delay
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8A2BE1] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Successful!</h2>
        <p className="text-gray-600">Opening your dashboard in a new tab...</p>
        <div className="mt-4">
          <a 
            href="/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#8A2BE1] hover:text-[#5d1a9a] underline"
          >
            Click here if dashboard doesn't open automatically
          </a>
        </div>
      </div>
    </div>
  )
}