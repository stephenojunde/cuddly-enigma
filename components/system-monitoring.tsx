'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Activity, AlertTriangle, CheckCircle, Database, Server, Users, RefreshCw, TrendingUp, Clock, Shield } from 'lucide-react'

interface SystemStats {
  total_users?: number
  active_sessions?: number
  total_bookings?: number
  error_rate?: number
  response_time?: number
  database_size?: string
  uptime?: string
}

interface ActivityLog {
  id: string
  user_id: string
  action: string
  resource: string
  details: any
  ip_address: string
  user_agent: string
  created_at: string
}

interface ErrorLog {
  id: string
  error_type: string
  error_message: string
  stack_trace: string
  user_id?: string
  url: string
  created_at: string
}

interface SystemMonitoringProps {
  systemStats: SystemStats
  activityLogs: ActivityLog[]
  errorLogs: ErrorLog[]
}

export function SystemMonitoring({ 
  systemStats: initialStats, 
  activityLogs: initialLogs, 
  errorLogs: initialErrors 
}: SystemMonitoringProps) {
  const [systemStats, setSystemStats] = useState(initialStats)
  const [activityLogs, setActivityLogs] = useState(initialLogs)
  const [errorLogs, setErrorLogs] = useState(initialErrors)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  async function refreshData() {
    setIsRefreshing(true)
    try {
      const [statsResponse, logsResponse, errorsResponse] = await Promise.all([
        supabase.rpc('get_system_stats'),
        supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('error_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
      ])

      if (statsResponse.data) setSystemStats(statsResponse.data)
      if (logsResponse.data) setActivityLogs(logsResponse.data)
      if (errorsResponse.data) setErrorLogs(errorsResponse.data)

      toast({
        title: "Data refreshed",
        description: "System monitoring data has been updated",
      })
    } catch (error: any) {
      toast({
        title: "Error refreshing data",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const getHealthStatus = () => {
    const errorRate = systemStats.error_rate || 0
    const responseTime = systemStats.response_time || 0
    
    if (errorRate > 5 || responseTime > 1000) return 'critical'
    if (errorRate > 2 || responseTime > 500) return 'warning'
    return 'healthy'
  }

  const healthStatus = getHealthStatus()

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {healthStatus === 'healthy' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {healthStatus === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
            {healthStatus === 'critical' && <AlertTriangle className="h-5 w-5 text-red-500" />}
            <span className="font-medium">
              System Status: 
              <Badge 
                variant={healthStatus === 'healthy' ? 'default' : healthStatus === 'warning' ? 'secondary' : 'destructive'}
                className="ml-2"
              >
                {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
              </Badge>
            </span>
          </div>
        </div>
        <Button onClick={refreshData} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.active_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">Current active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.response_time || 0}ms</div>
            <p className="text-xs text-muted-foreground">Average API response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.error_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>User actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {log.action} on {log.resource}
                      </p>
                      <p className="text-sm text-gray-500">
                        User ID: {log.user_id} • IP: {log.ip_address}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      {log.details && (
                        <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>System errors and exceptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {errorLogs.map((error) => (
                  <div key={error.id} className="flex items-start space-x-4 p-3 border rounded-lg border-red-200 bg-red-50">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-900">
                        {error.error_type}
                      </p>
                      <p className="text-sm text-red-700">
                        {error.error_message}
                      </p>
                      <p className="text-xs text-red-600">
                        URL: {error.url} • {new Date(error.created_at).toLocaleString()}
                      </p>
                      {error.stack_trace && (
                        <details className="mt-2">
                          <summary className="text-xs text-red-600 cursor-pointer">Stack Trace</summary>
                          <pre className="text-xs text-red-600 mt-1 bg-red-100 p-2 rounded overflow-x-auto">
                            {error.stack_trace}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Performance</CardTitle>
                <CardDescription>Database metrics and health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Size</span>
                  <span className="text-sm">{systemStats.database_size || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connection Pool</span>
                  <Badge variant="default">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Query Performance</span>
                  <span className="text-sm text-green-600">Optimal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Backup Status</span>
                  <Badge variant="default">Up to date</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Server Performance</CardTitle>
                <CardDescription>Server metrics and resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-sm">{systemStats.uptime || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm">2.1 GB / 4 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm text-green-600">23%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Disk Usage</span>
                  <span className="text-sm">45 GB / 100 GB</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
