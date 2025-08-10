import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { resendConfirmation } from '@/app/auth/actions'
import Link from 'next/link'

interface ResendConfirmationPageProps {
  searchParams: {
    error?: string
    message?: string
  }
}

export default function ResendConfirmationPage({ searchParams }: ResendConfirmationPageProps) {
  const { error, message } = searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Resend Confirmation</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a new confirmation link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error === 'Email is required' ? 'Please enter your email address.' :
                 error === 'Invalid email' ? 'Please enter a valid email address.' :
                 error === 'User not found' ? 'No account found with this email address.' :
                 error === 'Email already confirmed' ? 'Your email is already confirmed. You can sign in now.' :
                 'Failed to resend confirmation. Please try again.'}
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
                placeholder="Enter your email address"
                className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
              />
            </div>
            <Button formAction={resendConfirmation} className="w-full bg-[#8A2BE1] hover:bg-[#5d1a9a]">
              Resend Confirmation Email
            </Button>
          </form>
          
          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="text-[#8A2BE1] hover:text-[#5d1a9a] font-medium">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#8A2BE1] hover:text-[#5d1a9a] font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}