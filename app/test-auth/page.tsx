import { createClient } from '@/lib/server'

export const dynamic = 'force-dynamic'

export default async function TestAuthPage() {
  try {
    const supabase = await createClient()
    
    // Test if we can connect to Supabase
    const { data, error } = await supabase.auth.getSession()
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Environment Variables:</h3>
              <p className="text-sm">
                Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
              </p>
              <p className="text-sm">
                Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold">Supabase Connection:</h3>
              {error ? (
                <p className="text-red-600 text-sm">❌ Error: {error.message}</p>
              ) : (
                <p className="text-green-600 text-sm">✅ Connected successfully</p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold">Current Session:</h3>
              <p className="text-sm">
                User: {data?.session?.user?.email || 'Not logged in'}
              </p>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <a href="/signup" className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Test Signup
            </a>
            <a href="/login" className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              Test Login
            </a>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-semibold text-yellow-900 mb-2">Debug Info:</h4>
              <p className="text-sm text-yellow-800">
                Check the browser console and server logs for detailed error messages during signup.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Auth Test Failed</h1>
          <p className="text-red-600">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
}