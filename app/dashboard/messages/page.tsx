"use client"

import MessagingSystem from '@/components/messaging-system'

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">
          Communicate with tutors and parents
        </p>
      </div>

      <MessagingSystem />
    </div>
  )
}
