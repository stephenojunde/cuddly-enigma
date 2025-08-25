"use client"

import { useState, Suspense } from 'react'
import { signup } from '../auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [clientError, setClientError] = useState('')
  const searchParams = useSearchParams()

  const error = searchParams.get('error')
  const message = searchParams.get('message')

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setClientError('')

    // Client-side validation
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const email = formData.get('email') as string

    if (!email.includes('@')) {
      setClientError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setClientError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setClientError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      await signup(formData)
    } catch (err) {
      console.error('Signup error:', err)
      setClientError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join Tutelage Services and start your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || clientError) && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {clientError || error}
              </AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="Enter your first name"
                  className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="Enter your last name"
                  className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                placeholder="Enter your email"
                className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">I am a...</Label>
              <select
                id="userType"
                name="userType"
                required
                disabled={isLoading}
                aria-label="Select your role"
                aria-describedby="userType-description"
                title="Select your role to continue with registration"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
              >
                <option value="">Select your role</option>
                <option value="parent">Parent/Student - Looking for tutoring services</option>
                <option value="teacher">Teacher/Tutor - Offering tutoring services</option>
                <option value="school">School Administrator - Managing school needs</option>
              </select>
              <p id="userType-description" className="text-sm text-gray-500">
                Choose the role that best describes you. You can update this later.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Create a password (min. 6 characters)"
                minLength={6}
                className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Confirm your password"
                minLength={6}
                className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#8A2BE1] hover:bg-[#5d1a9a] disabled:opacity-50" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#8A2BE1] hover:text-[#5d1a9a] font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
