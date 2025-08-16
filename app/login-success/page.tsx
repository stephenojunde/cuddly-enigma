'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginSuccessPage() {
  const router = useRouter()
  const [dashboardOpened, setDashboardOpened] = useState(false)

  const openDashboard = () => {
    const newWindow = window.open('/dashboard', '_blank', 'noopener,noreferrer')
    if (newWindow) {
      setDashboardOpened(true)
      // Redirect current tab to home page after dashboard opens
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      // Popup was blocked, show manual link
      alert('Popup blocked! Please click the link below to open your dashboard.')
    }
  }

  useEffect(() => {
    // Try to open dashboard automatically after a short delay
    const timer = setTimeout(() => {
      openDashboard()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Successful! 🎉</h2>
          <p className="text-gray-600 mb-6">
            Welcome back! Your dashboard is ready.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={openDashboard}
            className="w-full bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-3 px-6 rounded-full transition-all hover:scale-105 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Dashboard in New Tab
          </button>

          <div className="text-sm text-gray-500">
            Or use these quick links:
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a 
              href="/tutors" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Find Tutors ↗
            </a>
            <a 
              href="/about" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              About Us ↗
            </a>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Return to Homepage
            </button>
          </div>
        </div>

        {dashboardOpened && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              ✅ Dashboard opened successfully! Redirecting to homepage...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}