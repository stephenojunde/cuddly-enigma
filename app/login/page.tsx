import LoginFormClient from './LoginFormClient'
import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams
  const nextParam = params?.next
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    if (nextParam && nextParam.startsWith('/')) {
      redirect(nextParam)
    }
    redirect('/dashboard')
  }

  return <LoginFormClient />
}
