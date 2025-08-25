"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import type { User } from '@supabase/supabase-js'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Basic validation
  if (!email || !password) {
    redirect('/login?error=Email and password are required')
  }

  if (!email.includes('@')) {
    redirect('/login?error=Please enter a valid email address')
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error.message)
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        redirect('/login?error=Invalid email or password')
      } else if (error.message.includes('Email not confirmed')) {
        redirect('/login?error=Please check your email and confirm your account')
      } else if (error.message.includes('Too many requests')) {
        redirect('/login?error=Too many login attempts. Please try again later')
      } else {
        redirect('/login?error=Login failed. Please try again')
      }
    }

    if (data.user) {
      console.log('Login successful for user:', data.user.email)
      
      // Ensure user profile exists
      await ensureUserProfile(supabase, data.user)
      
      console.log('About to redirect to login success page...')
    revalidatePath('/', 'layout')
    // Go straight to dashboard after successful login
    return redirect('/dashboard')
    } else {
      console.log('No user data returned from login')
      redirect('/login?error=Login failed. Please try again')
    }
  } catch (error) {
    // Check if this is a redirect error (which is expected)
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error // Re-throw redirect errors
    }
    
    console.error('Login exception:', error)
    redirect('/login?error=An unexpected error occurred')
  }
}

// Helper function to ensure user profile exists
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
async function ensureUserProfile(supabase: SupabaseServerClient, user: User) {
  try {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          user_type: user.user_metadata?.user_type || 'parent',
          phone: user.user_metadata?.phone || null,
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail login if profile creation fails
      }
    }
  } catch (error) {
    console.error('Profile check error:', error)
    // Don't fail login if profile check fails
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const userType = formData.get('userType') as string
  const phone = formData.get('phone') as string

  // Basic validation
  if (!email || !password || !confirmPassword || !firstName || !lastName || !userType) {
    redirect('/signup?error=All required fields must be filled')
  }

  if (!email.includes('@')) {
    redirect('/signup?error=Please enter a valid email address')
  }

  if (password.length < 6) {
    redirect('/signup?error=Password must be at least 6 characters long')
  }

  if (password !== confirmPassword) {
    redirect('/signup?error=Passwords do not match')
  }

  if (!['parent', 'teacher', 'school'].includes(userType)) {
    redirect('/signup?error=Please select a valid user type')
  }

  try {
    console.log('Starting signup process for:', email)
    console.log('User type:', userType)
    console.log('Phone:', phone)
    
    // Try a minimal signup first without metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      console.error('Supabase auth signup error:', error.message)
      console.error('Full error object:', JSON.stringify(error, null, 2))
      
      if (error.message.includes('User already registered')) {
        redirect('/signup?error=An account with this email already exists')
      } else if (error.message.includes('Password should be at least')) {
        redirect('/signup?error=Password must be at least 6 characters and contain a mix of characters')
      } else if (error.message.includes('Unable to validate email address')) {
        redirect('/signup?error=Please enter a valid email address')
      } else if (error.message.includes('Signup is disabled')) {
        redirect('/signup?error=Account registration is currently disabled')
      } else if (error.message.includes('Database error')) {
        console.error('Database error details:', error)
        redirect('/signup?error=Database configuration issue. Please contact support.')
      } else {
        redirect(`/signup?error=${encodeURIComponent(error.message)}`)
      }
    }

    if (data.user) {
      console.log('User created successfully:', data.user.id)
      
      // Now try to create the profile manually
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            user_type: userType,
            phone: phone || null
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          console.error('Profile error details:', JSON.stringify(profileError, null, 2))
        } else {
          console.log('Profile created successfully')
        }
      } catch (profileException) {
        console.error('Profile creation exception:', profileException)
      }
      
      // Check if email confirmation is required
      if (!data.session) {
        console.log('Email confirmation required')
        redirect('/login?message=Please check your email and click the confirmation link to activate your account')
      }
      
      console.log('Signup completed successfully')
      revalidatePath('/', 'layout')
      redirect('/dashboard?message=Welcome to Tutelage Services! Your account has been created successfully.')
    } else {
      console.error('No user data returned from signup')
      redirect('/signup?error=Account creation failed. Please try again')
    }
  } catch (error) {
    // Check if this is a redirect error (which is expected)
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error // Re-throw redirect errors
    }
    
    console.error('Signup exception:', error)
    console.error('Exception details:', JSON.stringify(error, null, 2))
    redirect('/signup?error=An unexpected error occurred. Please try again')
  }
}

export async function signout() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    console.error('Signout error:', error)
    redirect('/')
  }
}

export async function resendConfirmation(formData: FormData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string

    // Basic validation
    if (!email) {
      redirect('/resend-confirmation?error=Email is required')
    }

    if (!email.includes('@')) {
      redirect('/resend-confirmation?error=Invalid email')
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
      }
    })

    if (error) {
      console.error('Resend confirmation error:', error)
      if (error.message.includes('User not found')) {
        redirect('/resend-confirmation?error=User not found')
      } else if (error.message.includes('Email already confirmed')) {
        redirect('/resend-confirmation?error=Email already confirmed')
      } else {
        redirect('/resend-confirmation?error=Failed to resend confirmation')
      }
    }

    redirect('/resend-confirmation?message=Confirmation email sent! Please check your inbox and spam folder.')
  } catch (error) {
    console.error('Resend confirmation error:', error)
    redirect('/resend-confirmation?error=Failed to resend confirmation')
  }
}
