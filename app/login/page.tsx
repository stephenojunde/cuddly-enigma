'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { login } from '@/app/auth/actions'

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  
  // Check for URL parameters
  const urlError = searchParams.get('error')
  const message = searchParams.get('message')

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError('')

    try {
      await login(formData)
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {urlError && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {urlError === 'Invalid credentials' ? 'Invalid email or password. Please try again.' : 
                 urlError === 'Login failed' ? 'Login failed. Please try again.' :

                 'An error occurred. Please try again.'}
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

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                disabled={isLoading}
                className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#8A2BE1] hover:bg-[#5d1a9a]" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-[#8A2BE1] hover:text-[#5d1a9a] font-medium">
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
