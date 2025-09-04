'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

interface DBSRecord {
  id: string
  tutor_id: string
  certificate_number: string | null
  issue_date: string | null
  expiry_date: string | null
  dbs_type: 'basic' | 'standard' | 'enhanced'
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  certificate_file_url: string | null
  uploaded_at: string
  verified_at: string | null
  verified_by: string | null
  notes: string | null
  tutors: {
    id: string
    profile_id: string
    profiles: {
      full_name: string | null
      email: string
    }
  }
}

export default function AdminDBSClient() {
  const [dbsRecords, setDbsRecords] = useState<DBSRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<DBSRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchDBSRecords = useCallback(async () => {
    if (!mounted) return
    
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
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error('Error fetching DBS records:', error)
        toast({
          title: "Error",
          description: "Failed to fetch DBS records",
          variant: "destructive",
        })
        return
      }

      setDbsRecords(data || [])
    } catch (error) {
      console.error('Error fetching DBS records:', error)
      toast({
        title: "Error",
        description: "Failed to fetch DBS records",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, mounted])

  // Filter records based on search and filters
  useEffect(() => {
    if (!mounted) return
    
    let filtered = dbsRecords

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.tutors?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.tutors?.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [dbsRecords, searchTerm, statusFilter, typeFilter, mounted])

  useEffect(() => {
    if (mounted) {
      fetchDBSRecords()
    }
  }, [fetchDBSRecords, mounted])

  const handleVerifyDBS = async (recordId: string, action: 'verify' | 'reject', notes?: string) => {
    try {
      const { error } = await supabase
        .from('dbs_checks')
        .update({
          status: action === 'verify' ? 'verified' : 'rejected',
          verified_at: new Date().toISOString(),
          notes: notes || null
        })
        .eq('id', recordId)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: `DBS record ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
      })

      // Refresh the records
      fetchDBSRecords()
    } catch (error) {
      console.error('Error updating DBS record:', error)
      toast({
        title: "Error",
        description: `Failed to ${action} DBS record`,
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      verified: 'default',
      rejected: 'destructive',
      expired: 'secondary'
    } as const

    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'basic':
        return <Shield className="h-4 w-4 text-blue-500" />
      case 'standard':
        return <Shield className="h-4 w-4 text-green-500" />
      case 'enhanced':
        return <Shield className="h-4 w-4 text-purple-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStats = () => {
    const total = dbsRecords.length
    const pending = dbsRecords.filter(r => r.status === 'pending').length
    const verified = dbsRecords.filter(r => r.status === 'verified').length
    const expired = dbsRecords.filter(r => r.status === 'expired').length
    const rejected = dbsRecords.filter(r => r.status === 'rejected').length

    return { total, pending, verified, expired, rejected }
  }

  if (!mounted) {
    return null // Don't render anything on the server
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DBS Management</h1>
          <p className="text-gray-600">Manage and verify tutor DBS certificates</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8A2BE2] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading DBS records...</p>
        </div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">DBS Management</h1>
        <p className="text-gray-600">Manage and verify tutor DBS certificates</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#8A2BE2]" />
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-[#8A2BE2]">{stats.total}</p>
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
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
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
                placeholder="Search by name, email, or certificate number..."
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
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="enhanced">Enhanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No DBS records found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Try adjusting your filters to see more results'
                : 'DBS submissions will appear here once tutors upload their certificates'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="border-l-4 border-l-[#8A2BE2]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {record.tutors?.profiles?.full_name || 'Unknown Tutor'}
                    </h3>
                    <p className="text-gray-600">{record.tutors?.profiles?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(record.status)}
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getTypeIcon(record.dbs_type)}
                      {record.dbs_type.charAt(0).toUpperCase() + record.dbs_type.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Certificate Number</p>
                    <p className="font-medium">{record.certificate_number || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-medium">{formatDate(record.issue_date)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className="font-medium">{formatDate(record.expiry_date)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Uploaded</p>
                    <p className="font-medium">{formatDate(record.uploaded_at)}</p>
                  </div>
                  
                  {record.verified_at && (
                    <div>
                      <p className="text-sm text-gray-500">Verified</p>
                      <p className="font-medium">{formatDate(record.verified_at)}</p>
                    </div>
                  )}
                </div>

                {record.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm bg-gray-50 p-2 rounded">{record.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {record.certificate_file_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(record.certificate_file_url!, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View Certificate
                    </Button>
                  )}

                  {record.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleVerifyDBS(record.id, 'verify')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Verify
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleVerifyDBS(record.id, 'reject', 'Rejected by admin')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
