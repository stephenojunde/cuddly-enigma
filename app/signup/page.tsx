import { signup } from '../auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

interface SignupPageProps {
  searchParams: Promise<{
    error?: string
    message?: string
  }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error, message } = await searchParams
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join Tutelage Services to access our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error === 'Could not create account' ? 'Failed to create account. Please check your email and try again.' :
                 error === 'Signup failed' ? 'Signup failed. Please try again.' :
                 'An error occurred during signup. Please try again.'}
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

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
              />
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
            <Button formAction={signup} className="w-full bg-[#8A2BE1] hover:bg-[#5d1a9a]">
              Create Account
            </Button>
          </form>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              📧 After creating your account, you'll receive a confirmation email. Please check your inbox (and spam folder) and click the confirmation link before signing in.
            </p>
          </div>
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
