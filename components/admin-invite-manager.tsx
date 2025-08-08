'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Copy, Mail, Trash2 } from 'lucide-react'

interface AdminInvite {
  id: string
  email: string
  invite_code: string
  is_used: boolean
  expires_at: string
  created_at: string
}

interface AdminInviteManagerProps {
  invites: AdminInvite[]
}

export function AdminInviteManager({ invites: initialInvites }: AdminInviteManagerProps) {
  const [invites, setInvites] = useState(initialInvites)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  async function createInvite(formData: FormData) {
    setIsLoading(true)
    const email = formData.get('email') as string

    try {
      const inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

      const { data, error } = await supabase
        .from('admin_invites')
        .insert([
          {
            email,
            invite_code: inviteCode,
            expires_at: expiresAt.toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error

      setInvites([data, ...invites])
      
      toast({
        title: "Invite created!",
        description: `Admin invite sent to ${email}`,
      })

      // Reset form
      const form = document.getElementById('invite-form') as HTMLFormElement
      form.reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create invite",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteInvite(inviteId: string) {
    try {
      const { error } = await supabase
        .from('admin_invites')
        .delete()
        .eq('id', inviteId)

      if (error) throw error

      setInvites(invites.filter(invite => invite.id !== inviteId))
      
      toast({
        title: "Invite deleted",
        description: "Admin invite has been removed",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invite",
        variant: "destructive",
      })
    }
  }

  function copyInviteLink(inviteCode: string) {
    const inviteUrl = `${window.location.origin}/admin/signup?code=${inviteCode}`
    navigator.clipboard.writeText(inviteUrl)
    
    toast({
      title: "Link copied!",
      description: "Admin invite link copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Admin Invite</CardTitle>
          <CardDescription>
            Send an invitation to create a new admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="invite-form" action={createInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@example.com"
                className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#8A2BE1] hover:bg-[#5d1a9a]"
            >
              {isLoading ? 'Creating Invite...' : 'Create Admin Invite'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Invites</CardTitle>
          <CardDescription>
            Manage pending and used admin invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invites.length > 0 ? (
              invites.map((invite) => {
                const isExpired = new Date(invite.expires_at) < new Date()
                const inviteUrl = `${window.location.origin}/admin/signup?code=${invite.invite_code}`
                
                return (
                  <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(invite.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expires: {new Date(invite.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          invite.is_used ? 'default' : 
                          isExpired ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {invite.is_used ? 'Used' : isExpired ? 'Expired' : 'Pending'}
                      </Badge>
                      {!invite.is_used && !isExpired && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInviteLink(invite.invite_code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`mailto:${invite.email}?subject=Admin Account Invitation&body=You've been invited to create an admin account. Use this link: ${inviteUrl}`)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteInvite(invite.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 text-center py-8">No admin invites created yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
