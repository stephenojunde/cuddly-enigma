'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Shield, AlertTriangle, CheckCircle2, Clock, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/client'

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
}

interface DBSVerificationProps {
  tutorId: string
  currentDBS?: DBSRecord
  isAdmin?: boolean
}

export function DBSVerification({ tutorId, currentDBS, isAdmin = false }: DBSVerificationProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dbsData, setDbsData] = useState({
    certificate_number: currentDBS?.certificate_number || '',
    dbs_type: currentDBS?.dbs_type || 'enhanced',
    issue_date: currentDBS?.issue_date || '',
    notes: currentDBS?.notes || ''
  })
  const { toast } = useToast()
  const supabase = createClient()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPEG, or PNG file",
        variant: "destructive"
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${tutorId}-dbs-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('dbs-certificates')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('dbs-certificates')
        .getPublicUrl(fileName)

      // Save DBS record to database
      const { error: dbError } = await supabase
        .from('dbs_checks')
        .upsert({
          tutor_id: tutorId,
          certificate_number: dbsData.certificate_number,
          dbs_type: dbsData.dbs_type,
          issue_date: dbsData.issue_date,
          document_url: publicUrl,
          notes: dbsData.notes,
          status: 'pending'
        })

      if (dbError) throw dbError

      toast({
        title: "DBS certificate uploaded",
        description: "Your certificate is now pending verification",
      })

      // Refresh the page or update state
      window.location.reload()

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your certificate",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleVerification = async (status: 'verified' | 'rejected', adminNotes?: string) => {
    if (!isAdmin || !currentDBS) return

    try {
      const { error } = await supabase
        .from('dbs_checks')
        .update({
          status,
          verified_at: new Date().toISOString(),
          notes: adminNotes || currentDBS.notes
        })
        .eq('id', currentDBS.id)

      if (error) throw error

      toast({
        title: status === 'verified' ? "DBS verified" : "DBS rejected",
        description: `Certificate has been ${status}`,
      })

      window.location.reload()

    } catch (error: unknown) {
      console.error('Verification error:', error)
      toast({
        title: "Verification failed",
        description: "There was an error updating the verification status",
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

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Current DBS Status */}
      {currentDBS && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  DBS Certificate
                </CardTitle>
                <CardDescription>Certificate #{currentDBS.certificate_number}</CardDescription>
              </div>
              {getStatusBadge(currentDBS.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <p className="text-sm text-gray-600">
                  {currentDBS.dbs_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Issue Date</Label>
                <p className="text-sm text-gray-600">
                  {new Date(currentDBS.issue_date).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>

            {currentDBS.expiry_date && (
              <div>
                <Label className="text-sm font-medium">Renewal Due</Label>
                <p className={`text-sm ${isExpired(currentDBS.expiry_date) ? 'text-red-600' : 'text-gray-600'}`}>
                  {new Date(currentDBS.expiry_date).toLocaleDateString('en-GB')}
                  {isExpired(currentDBS.expiry_date) && ' (EXPIRED)'}
                </p>
              </div>
            )}

            {currentDBS.document_url && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentDBS.document_url!, '_blank')}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Certificate
                </Button>
              </div>
            )}

            {currentDBS.notes && (
              <div>
                <Label className="text-sm font-medium">Notes</Label>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{currentDBS.notes}</p>
              </div>
            )}

            {/* Admin Verification Controls */}
            {isAdmin && currentDBS.status === 'pending' && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Admin Verification</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleVerification('verified')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Verify Certificate
                  </Button>
                  <Button
                    onClick={() => handleVerification('rejected')}
                    variant="destructive"
                  >
                    Reject Certificate
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload New Certificate */}
      {(!currentDBS || currentDBS.status === 'rejected' || isExpired(currentDBS.expiry_date)) && (
        <Card>
          <CardHeader>
            <CardTitle>Upload DBS Certificate</CardTitle>
            <CardDescription>
              All tutors must provide a valid Enhanced DBS check for working with children
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certificate_number">Certificate Number</Label>
                <Input
                  id="certificate_number"
                  value={dbsData.certificate_number}
                  onChange={(e) => setDbsData(prev => ({ ...prev, certificate_number: e.target.value }))}
                  placeholder="Enter DBS certificate number"
                />
              </div>
              <div>
                <Label htmlFor="dbs_type">DBS Type</Label>
                <Select
                  value={dbsData.dbs_type}
                  onValueChange={(value) => setDbsData(prev => ({ ...prev, dbs_type: value as DBSRecord['dbs_type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enhanced">Enhanced</SelectItem>
                    <SelectItem value="enhanced_barred">Enhanced with Barred Lists</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="issue_date">Issue Date</Label>
              <Input
                id="issue_date"
                type="date"
                value={dbsData.issue_date}
                onChange={(e) => setDbsData(prev => ({ ...prev, issue_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={dbsData.notes}
                onChange={(e) => setDbsData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information about your DBS check"
              />
            </div>

            <div>
              <Label htmlFor="certificate_file">Upload Certificate</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> DBS certificate
                    </p>
                    <p className="text-xs text-gray-500">PDF, PNG or JPG (MAX. 5MB)</p>
                  </div>
                  <input
                    id="certificate_file"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            {isUploading && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Uploading certificate...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* DBS Information */}
      <Card>
        <CardHeader>
          <CardTitle>About DBS Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Why do we require DBS checks?</h4>
            <p className="text-sm text-blue-800">
              As a platform connecting tutors with children, we are committed to safeguarding. 
              All tutors must have a valid Enhanced DBS check to ensure child safety and comply with UK regulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Required for Tutors:</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• Enhanced DBS check (recommended)</li>
                <li>• Must be less than 3 years old</li>
                <li>• Clear criminal record check</li>
                <li>• Regular renewals required</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">How to get a DBS check:</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• Apply through gov.uk</li>
                <li>• Use a registered DBS provider</li>
                <li>• Cost: £23-£44 depending on type</li>
                <li>• Processing time: 2-8 weeks</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => window.open('https://www.gov.uk/request-copy-criminal-record', '_blank')}
            >
              Apply for DBS Check
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DBSVerification
