'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Search, Check, X, Eye, Edit, Trash2 } from 'lucide-react'
import { safeString, safeArray } from '@/lib/utils'

interface User {
  id: string
  email?: string
  full_name?: string
  user_type: string
  is_admin: boolean
  created_at: string
  avatar_url?: string
}

interface Application {
  id: string
  name: string
  email: string
  subjects: string[]
  status: string
  created_at: string
  qualifications?: string
  experience?: string
}

interface UserManagementProps {
  users: User[]
  applications: Application[]
}

export function UserManagement({ users: initialUsers, applications: initialApplications }: UserManagementProps) {
  const [users, setUsers] = useState(initialUsers)
  const [applications, setApplications] = useState(initialApplications)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const filteredUsers = users.filter(user =>
    safeString(user.full_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    safeString(user.email).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredApplications = applications.filter(app =>
    safeString(app.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    safeString(app.email).toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function updateApplicationStatus(applicationId: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('tutor_applications')
        .update({ status })
        .eq('id', applicationId)

      if (error) throw error

      // If approved, create tutor profile
      if (status === 'approved') {
        const application = applications.find(app => app.id === applicationId)
        if (application) {
          const { error: tutorError } = await supabase
            .from('tutors')
            .insert([
              {
                name: application.name,
                email: application.email,
                subjects: application.subjects,
                qualifications: application.qualifications,
                experience_years: 1, // Default value
                bio: application.experience,
                is_verified: true,
                is_active: true
              }
            ])

          if (tutorError) throw tutorError
        }
      }

      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ))
      
      toast({
        title: "Application updated",
        description: `Application has been ${status}`,
      })
    } catch (error: any) {
      toast({
        title: "Error updating application",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  async function toggleUserAdmin(userId: string, isAdmin: boolean) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !isAdmin })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: !isAdmin } : user
      ))
      
      toast({
        title: "User updated",
        description: `Admin status ${!isAdmin ? 'granted' : 'removed'}`,
      })
    } catch (error: any) {
      toast({
        title: "Error updating user",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin': return 'destructive'
      case 'teacher': return 'default'
      case 'school': return 'secondary'
      case 'parent': return 'outline'
      default: return 'outline'
    }
  }

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'rejected': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <Tabs defaultValue="users" className="space-y-6">
      <TabsList>
        <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
        <TabsTrigger value="applications">
          Applications ({applications.filter(app => app.status === 'pending').length} pending)
        </TabsTrigger>
      </TabsList>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users or applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {safeString(user.full_name || user.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{safeString(user.full_name) || 'No name'}</p>
                      <p className="text-sm text-gray-600">{safeString(user.email)}</p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getUserTypeColor(user.user_type)} className="capitalize">
                      {user.user_type}
                    </Badge>
                    {user.is_admin && (
                      <Badge variant="destructive">Admin</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                    >
                      {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="applications">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tutor Applications</CardTitle>
              <CardDescription>Review and approve tutor applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredApplications.map((application) => (
                  <div 
                    key={application.id} 
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedApplication?.id === application.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedApplication(application)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{safeString(application.name)}</p>
                        <p className="text-sm text-gray-600">{safeString(application.email)}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {safeArray(application.subjects).slice(0, 3).map((subject, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {safeString(subject)}
                            </Badge>
                          ))}
                          {application.subjects.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{application.subjects.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={getApplicationStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {new Date(application.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedApplication && (
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>Review application information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Applicant Information</h4>
                  <p><strong>Name:</strong> {safeString(selectedApplication.name)}</p>
                  <p><strong>Email:</strong> {safeString(selectedApplication.email)}</p>
                  <p><strong>Status:</strong> 
                    <Badge variant={getApplicationStatusColor(selectedApplication.status)} className="ml-2">
                      {selectedApplication.status}
                    </Badge>
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Subjects</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {safeArray(selectedApplication.subjects).map((subject, index) => (
                      <Badge key={index} variant="secondary">
                        {safeString(subject)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedApplication.qualifications && (
                  <div>
                    <h4 className="font-semibold">Qualifications</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {selectedApplication.qualifications}
                    </p>
                  </div>
                )}

                {selectedApplication.experience && (
                  <div>
                    <h4 className="font-semibold">Experience</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {selectedApplication.experience}
                    </p>
                  </div>
                )}

                {selectedApplication.status === 'pending' && (
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
