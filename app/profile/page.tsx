import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
              <CardDescription className="text-center">
                Help us personalize your experience by completing your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
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
                    value={user.email || ''}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userType">I am a...</Label>
                  <Select name="userType" required>
                    <SelectTrigger className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent/Student</SelectItem>
                      <SelectItem value="teacher">Teacher/Tutor</SelectItem>
                      <SelectItem value="school">School Administrator</SelectItem>
                    </SelectContent>
                  </Select>
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

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="City, Country"
                    className="focus:ring-[#8A2BE1] focus:border-[#8A2BE1]"
                  />
                </div>

                <Button type="submit" className="w-full bg-[#8A2BE1] hover:bg-[#5d1a9a]">
                  Complete Profile
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  You can always update your profile later from your dashboard.
                </p>
                <a 
                  href="/dashboard" 
                  className="text-[#8A2BE1] hover:text-[#5d1a9a] font-medium text-sm"
                >
                  Skip for now
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}