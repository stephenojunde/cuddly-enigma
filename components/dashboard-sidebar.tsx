'use client'

import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, UserIcon, BookOpen, Calendar, MessageSquare, Settings, Users, School, FileText, BarChart3, Shield, Briefcase, GraduationCap, Bell } from 'lucide-react'

interface Profile {
  id: string
  user_type: 'parent' | 'teacher' | 'school' | 'admin'
  is_admin: boolean
  school_id?: string
  schools?: { name: string }
}

interface DashboardSidebarProps {
  user: User
  profile: Profile
}

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
      { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]

    switch (profile?.user_type) {
      case 'parent':
        return [
          ...baseItems.slice(0, 1), // Dashboard
          { name: 'My Children', href: '/dashboard/children', icon: Users },
          { name: 'Tutors', href: '/dashboard/tutors', icon: GraduationCap },
          { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
          { name: 'Progress', href: '/dashboard/progress', icon: BarChart3 },
          ...baseItems.slice(1), // Profile, Messages, Settings
        ]

      case 'teacher':
        return [
          ...baseItems.slice(0, 1), // Dashboard
          { name: 'My Students', href: '/dashboard/students', icon: Users },
          { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
          { name: 'DBS Verification', href: '/dashboard/dbs', icon: Shield },
          { name: 'Job Applications', href: '/dashboard/applications', icon: Briefcase },
          { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
          ...baseItems.slice(1), // Profile, Messages, Settings
        ]

      case 'school':
        return [
          ...baseItems.slice(0, 1), // Dashboard
          { name: 'Teachers', href: '/dashboard/teachers', icon: Users },
          { name: 'Job Postings', href: '/dashboard/jobs', icon: Briefcase },
          { name: 'Announcements', href: '/dashboard/announcements', icon: Bell },
          { name: 'Events', href: '/dashboard/events', icon: Calendar },
          { name: 'Resources', href: '/dashboard/resources', icon: FileText },
          ...baseItems.slice(1), // Profile, Messages, Settings
        ]

      default:
        return baseItems
    }
  }

  const adminItems = (profile?.is_admin) ? [
    { name: 'Admin Panel', href: '/dashboard/admin', icon: Shield },
    { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
    { name: 'DBS Management', href: '/dashboard/admin/dbs', icon: Shield },
    { name: 'Content Management', href: '/dashboard/admin/content', icon: FileText },
    { name: 'System Settings', href: '/dashboard/admin/system', icon: Settings },
  ] : []

  const navigationItems = [...getNavigationItems(), ...adminItems]

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Tutelage</h1>
        <p className="text-sm text-gray-500 capitalize mt-1">
          {profile?.user_type || 'user'} Dashboard
        </p>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {profile?.school_id && profile?.schools && (
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="flex items-center">
            <School className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">{profile.schools.name || 'School'}</p>
              <p className="text-xs text-gray-500">School</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
