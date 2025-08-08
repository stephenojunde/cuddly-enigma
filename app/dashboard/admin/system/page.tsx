import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { SystemMonitoring } from '@/components/system-monitoring'

export const dynamic = 'force-dynamic'

export default async function AdminSystemPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  // Fetch system metrics
  const { data: systemStats } = await supabase.rpc('get_system_stats')
  const { data: activityLogs } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: errorLogs } = await supabase
    .from('error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
        <p className="text-gray-600">Monitor system health and performance</p>
      </div>
      
      <SystemMonitoring 
        systemStats={systemStats || {}}
        activityLogs={activityLogs || []}
        errorLogs={errorLogs || []}
      />
    </div>
  )
}
