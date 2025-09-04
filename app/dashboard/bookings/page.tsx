"use client"

import { useState } from 'react'
import BookingSystem from '@/components/booking-system'
import ChildrenManager from '@/components/children-manager'

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('bookings')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your tutoring sessions and children&apos;s profiles
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab('children')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'children'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Children
          </button>
        </nav>
      </div>
      
      <div className="mt-6">
        {activeTab === 'bookings' && <BookingSystem mode="manage" />}
        {activeTab === 'children' && <ChildrenManager />}
      </div>
    </div>
  )
}
