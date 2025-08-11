import { createClient } from '@/lib/server'

export const dynamic = 'force-dynamic'

async function testSignup() {
  'use server'
  
  const supabase = await createClient()
  
  console.log('Testing basic Supabase signup...')
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          user_type: 'parent'
        }
      }
    })
    
    console.log('Test signup result:', { data, error })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, user: data.user?.email }
  } catch (error) {
    console.error('Test signup exception:', error)
    return { success: false, error: 'Exception occurred' }
  }
}

export default async function TestSignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Test Signup</h1>
        
        <form action={testSignup} className="space-y-4">
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Test Supabase Signup
          </button>
        </form>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>This will test a basic signup with Supabase.</p>
          <p>Check the server console for detailed logs.</p>
        </div>
      </div>
    </div>
  )
}