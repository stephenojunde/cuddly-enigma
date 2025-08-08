import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { AdminSignupForm } from '@/components/admin-signup-form'

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
