'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText,
  Calendar,
  Users
} from 'lucide-react'
import { createClient } from '@/lib/client'
import { useToast } from '@/hooks/use-toast'
import DBSVerification from '@/components/dbs-verification'

interface DBSRecord {
  id: string
  tutor_id: string
  certificate_number: string
  dbs_type: 'basic' | 'standard' | 'enhanced' | 'enhanced_barred'
  issue_date: string
  status: 'pending' | 'verified' | 'expired' | 'rejected'
  expiry_date: string | null
  verified_by: string | null
  verified_at: string | null
  document_url: string | null
  notes: string | null
  created_at: string
  tutors: {
    id: string
    profile_id: string
    profiles: {
      full_name: string
      email: string
    }
  }
}

export default function AdminDBSManagement() {
  const [dbsRecords, setDbsRecords] = useState<DBSRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<DBSRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  
  const { toast } = useToast()
  const supabase = createClient()

  const fetchDBSRecords = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dbs_checks')
        .select(`
          *,
          tutors (
            id,
            profile_id,
            profiles (
              full_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbsRecords(data || [])
    } catch (error) {
      console.error('Error fetching DBS records:', error)
      toast({
        title: "Error",
        description: "Failed to load DBS records",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  const filterRecords = useCallback(() => {
    let filtered = dbsRecords

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.tutors.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.tutors.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.dbs_type === typeFilter)
    }

    setFilteredRecords(filtered)
  }, [dbsRecords, searchTerm, statusFilter, typeFilter])

  useEffect(() => {
    fetchDBSRecords()
  }, [fetchDBSRecords])

  useEffect(() => {
    filterRecords()
  }, [filterRecords])

  const handleVerification = async (recordId: string, status: 'verified' | 'rejected', notes?: string) => {
    try {
      const { error } = await supabase
        .from('dbs_checks')
        .update({
          status,
          verified_at: new Date().toISOString(),
          notes: notes
        })
        .eq('id', recordId)

      if (error) throw error

      toast({
        title: status === 'verified' ? "DBS Verified" : "DBS Rejected",
        description: `Certificate has been ${status}`,
      })

      // Refresh data
      fetchDBSRecords()
    } catch (error) {
      console.error('Error updating verification:', error)
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: DBSRecord['status']) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      expired: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      rejected: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    }
    
    const { color, icon: Icon } = variants[status]
    
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getStats = () => {
    const total = dbsRecords.length
    const pending = dbsRecords.filter(r => r.status === 'pending').length
    const verified = dbsRecords.filter(r => r.status === 'verified').length
    const expired = dbsRecords.filter(r => r.status === 'expired').length
    const rejected = dbsRecords.filter(r => r.status === 'rejected').length

    return { total, pending, verified, expired, rejected }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading DBS records...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">DBS Management</h1>
        <p className="text-gray-600">Manage tutor DBS (Disclosure and Barring Service) checks</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by certificate number, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="enhanced">Enhanced</SelectItem>
                  <SelectItem value="enhanced_barred">Enhanced + Barred</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">All Records</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="expired">Expiring Soon</TabsTrigger>
        </TabsList>

        {/* All Records Tab */}
        <TabsContent value="list" className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No DBS records found</h3>
                <p className="text-gray-500">No records match your current filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-4">
                          <h3 className="font-medium text-lg">
                            {record.tutors.profiles.full_name}
                          </h3>
                          {getStatusBadge(record.status)}
                          <Badge variant="outline" className="text-xs">
                            {record.dbs_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Certificate #:</span>
                            <p>{record.certificate_number}</p>
                          </div>
                          <div>
                            <span className="font-medium">Email:</span>
                            <p>{record.tutors.profiles.email}</p>
                          </div>
                          <div>
                            <span className="font-medium">Issue Date:</span>
                            <p>{new Date(record.issue_date).toLocaleDateString('en-GB')}</p>
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span>
                            <p>{new Date(record.created_at).toLocaleDateString('en-GB')}</p>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-sm">Notes:</span>
                            <p className="text-sm text-gray-700 mt-1">{record.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {record.document_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(record.document_url!, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                        
                        {record.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleVerification(record.id, 'verified')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleVerification(record.id, 'rejected')}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Review Tab */}
        <TabsContent value="pending" className="space-y-4">
          {filteredRecords.filter(r => r.status === 'pending').map((record) => (
            <Card key={record.id} className="border-yellow-200">
              <CardContent className="p-6">
                <DBSVerification 
                  tutorId={record.tutor_id}
                  currentDBS={record}
                  isAdmin={true}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Expiring Soon Tab */}
        <TabsContent value="expired" className="space-y-4">
          {filteredRecords
            .filter(r => {
              if (!r.expiry_date) return false
              const expiryDate = new Date(r.expiry_date)
              const threeMonthsFromNow = new Date()
              threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
              return expiryDate <= threeMonthsFromNow
            })
            .map((record) => (
              <Card key={record.id} className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    {record.tutors.profiles.full_name} - Renewal Required
                  </CardTitle>
                  <CardDescription>
                    DBS expires on {record.expiry_date && new Date(record.expiry_date).toLocaleDateString('en-GB')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Certificate: {record.certificate_number}</p>
                      <p className="text-sm text-gray-600">Email: {record.tutors.profiles.email}</p>
                    </div>
                    <Button variant="outline">
                      Send Reminder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
