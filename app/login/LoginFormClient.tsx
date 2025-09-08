"use client"

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { login } from '@/app/auth/actions'
import { ArrowLeft } from 'lucide-react'

function InnerLoginForm() {
  const [isLoading] = useState(false)
  const [error] = useState('')
  const searchParams = useSearchParams()

  const urlError = searchParams.get('error')
  const message = searchParams.get('message')
  const nextParam = searchParams.get('next')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Homepage Link */}
      <Link 
        href="/" 
        className="fixed top-6 left-6 flex items-center space-x-2 text-[#8A2BE1] hover:text-[#5d1a9a] transition-colors duration-200 z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Logo */}
      <Link href="/" className="fixed top-6 left-1/2 transform -translate-x-1/2 z-10">
        <Image 
          src="/images/logo 1.png" 
          alt="Tutelage Services Logo" 
          width={120} 
          height={32} 
          className="h-8 w-auto hover:scale-105 transition-transform duration-300" 
          priority
        />
      </Link>

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
                {urlError === 'Invalid email or password' ? 'Invalid email or password. Please check your credentials and try again.' : 
                 urlError === 'Please check your email and confirm your account' ? 'Please check your email and click the confirmation link to activate your account.' :
                 urlError === 'Too many login attempts. Please try again later' ? 'Too many login attempts. Please wait a few minutes before trying again.' :
                 urlError === 'Email and password are required' ? 'Please enter both email and password.' :
                 urlError === 'Please enter a valid email address' ? 'Please enter a valid email address.' :
                 urlError}
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

          <form action={login} className="space-y-4">
            {nextParam && nextParam.startsWith('/') && (
              <input type="hidden" name="next" value={nextParam} />
            )}
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
              className="w-full bg-[#8A2BE1] hover:bg-[#5d1a9a] disabled:opacity-50" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
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

export default function LoginFormClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InnerLoginForm />
    </Suspense>
  )
}
