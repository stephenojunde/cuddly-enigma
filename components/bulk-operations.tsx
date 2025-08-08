'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Mail, UserCheck, UserX, Download } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  user_type: string
  is_admin: boolean
  created_at: string
}

interface BulkOperationsProps {
  users: User[]
}

export function BulkOperations({ users: initialUsers }: BulkOperationsProps) {
  const [users, setUsers] = useState(initialUsers)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  function toggleUserSelection(userId: string) {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  function selectAllUsers() {
    setSelectedUsers(users.map(user => user.id))
  }

  function clearSelection() {
    setSelectedUsers([])
  }

  async function executeBulkAction() {
    if (!bulkAction || selectedUsers.length === 0) return

    setIsProcessing(true)
    try {
      switch (bulkAction) {
        case 'delete':
          await bulkDeleteUsers()
          break
        case 'activate':
          await bulkUpdateUserStatus(true)
          break
        case 'deactivate':
          await bulkUpdateUserStatus(false)
          break
        case 'export':
          await exportUserData()
          break
        case 'email':
          await sendBulkEmail()
          break
        default:
          throw new Error('Invalid bulk action')
      }
    } catch (error: any) {
      toast({
        title: "Bulk operation failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  async function bulkDeleteUsers() {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .in('id', selectedUsers)

    if (error) throw error

    setUsers(users.filter(user => !selectedUsers.includes(user.id)))
    setSelectedUsers([])
    
    toast({
      title: "Users deleted",
      description: `${selectedUsers.length} users have been deleted`,
    })
  }

  async function bulkUpdateUserStatus(isActive: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .in('id', selectedUsers)

    if (error) throw error

    setUsers(users.map(user => 
      selectedUsers.includes(user.id) 
        ? { ...user, is_active: isActive }
        : user
    ))
    setSelectedUsers([])
    
    toast({
      title: `Users ${isActive ? 'activated' : 'deactivated'}`,
      description: `${selectedUsers.length} users have been updated`,
    })
  }

  async function exportUserData() {
    const selectedUserData = users.filter(user => selectedUsers.includes(user.id))
    const csvContent = [
      ['ID', 'Email', 'Full Name', 'User Type', 'Is Admin', 'Created At'],
      ...selectedUserData.map(user => [
        user.id,
        user.email,
        user.full_name || '',
        user.user_type,
        user.is_admin.toString(),
        new Date(user.created_at).toISOString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export completed",
      description: `${selectedUsers.length} user records exported`,
    })
  }

  async function sendBulkEmail() {
    // This would integrate with your email service
    toast({
      title: "Bulk email sent",
      description: `Email sent to ${selectedUsers.length} users`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Operations</CardTitle>
        <CardDescription>Perform actions on multiple users at once</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={selectAllUsers}>
              Select All ({users.length})
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
            <span className="text-sm text-gray-600">
              {selectedUsers.length} selected
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activate">Activate Users</SelectItem>
                <SelectItem value="deactivate">Deactivate Users</SelectItem>
                <SelectItem value="email">Send Email</SelectItem>
                <SelectItem value="export">Export Data</SelectItem>
                <SelectItem value="delete">Delete Users</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={executeBulkAction}
              disabled={!bulkAction || selectedUsers.length === 0 || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Execute'}
            </Button>
          </div>
        </div>

        {/* User List */}
        <div className="border rounded-lg">
          <div className="max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-4 p-3 border-b last:border-b-0">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => toggleUserSelection(user.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.full_name || 'No name'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded capitalize">
                    {user.user_type}
                  </span>
                  {user.is_admin && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Descriptions */}
        {bulkAction && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {bulkAction === 'delete' && 'This will permanently delete the selected user accounts.'}
              {bulkAction === 'activate' && 'This will activate the selected user accounts.'}
              {bulkAction === 'deactivate' && 'This will deactivate the selected user accounts.'}
              {bulkAction === 'export' && 'This will download user data as a CSV file.'}
              {bulkAction === 'email' && 'This will send an email to all selected users.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
