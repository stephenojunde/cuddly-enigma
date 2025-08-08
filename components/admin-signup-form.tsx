'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface AdminSignupFormProps {
  inviteCode: string
  email: string
}

export function AdminSignupForm({ inviteCode, email }: AdminSignupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const fullName = formData.get('fullName') as string

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      // Create the admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: 'admin'
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Update the profile to mark as admin
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            is_admin: true,
            user_type: 'admin',
            full_name: fullName
          })
          .eq('id', authData.user.id)

        if (profileError) throw profileError

        // Mark the invite as used
        const { error: inviteError } = await supabase
          .from('admin_invites')
          .update({ is_used: true })
          .eq('invite_code', inviteCode)

        if (inviteError) throw inviteError

        toast({
          title: "Success!",
          description: "Admin account created successfully. Please check your email to verify your account.",
        })

        router.push('/login?message=Admin account created. Please verify your email.')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Admin Setup</CardTitle>
        <CardDescription className="text-center">
          Complete your admin account setup
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (Pre-filled)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Enter your full name"
              className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Create a secure password"
              className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              placeholder="Confirm your password"
              className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#8A2BE1] hover:bg-[#5d1a9a]"
          >
            {isLoading ? 'Creating Account...' : 'Create Admin Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
