export function checkEnvironmentVariables() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`
    console.error(errorMessage)
    console.error('Please check your .env.local file and ensure all required variables are set.')
    return { isValid: false, missingVars, errorMessage }
  }

  return { isValid: true, missingVars: [], errorMessage: null }
}

export function getSupabaseConfig() {
  const envCheck = checkEnvironmentVariables()
  
  if (!envCheck.isValid) {
    throw new Error(envCheck.errorMessage!)
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }
}
