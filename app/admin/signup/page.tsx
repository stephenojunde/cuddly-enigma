import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { AdminSignupForm } from '@/components/admin-signup-form'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface AdminSignupPageProps {
  searchParams: {
    code?: string
  }
}

export default async function AdminSignupPage({ searchParams }: AdminSignupPageProps) {
  const supabase = await createClient()
  
  if (!searchParams.code) {
    redirect('/login?error=Invalid admin invite code')
  }

  // Verify the invite code
  const { data: invite } = await supabase
    .from('admin_invites')
    .select('*')
    .eq('invite_code', searchParams.code)
    .eq('is_used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invite) {
    redirect('/login?error=Invalid or expired admin invite code')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Homepage Link */}
      <Link 
        href="/" 
        className="fixed top-6 left-6 flex items-center space-x-2 text-[#8A2BE1] hover:text-[#5d1a9a] transition-colors duration-200 z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Logo */}
      <Link href="/" className="fixed top-6 left-1/2 transform -translate-x-1/2 z-10">
        <Image 
          src="/images/logo 1.png" 
          alt="Tutelage Services Logo" 
          width={120} 
          height={32} 
          className="h-8 w-auto hover:scale-105 transition-transform duration-300" 
          priority
        />
      </Link>

      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Account Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your admin account using the invitation code
          </p>
        </div>
        <AdminSignupForm inviteCode={searchParams.code} email={invite.email} />
      </div>
    </main>
  )
}
