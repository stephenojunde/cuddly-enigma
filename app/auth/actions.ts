'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('Login attempt for:', email)

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
      console.error('Login error:', error)
      if (error.message.includes('Invalid login credentials')) {
        redirect('/login?error=Invalid credentials')
      } else {
        redirect('/login?error=Login failed')
      }
    }

    if (data.user) {
      console.log('Login successful for user:', data.user.email)
      revalidatePath('/', 'layout')
      redirect('/dashboard')
    } else {
      console.log('Login failed: No user data returned')
      redirect('/login?error=Login failed')
    }
  } catch (error) {
    console.error('Login exception:', error)
    
    // Check if this is a redirect error (which is expected)
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error // Re-throw redirect errors
    }
    
    redirect('/login?error=Login failed')
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

  console.log('Signup attempt for:', email, 'with role:', userType)
  console.log('Form data received:', { firstName, lastName, userType, phone: phone || 'none' })

  // Basic validation
  if (!email || !password || !confirmPassword || !firstName || !lastName || !userType) {
    console.log('Validation failed: Missing required fields')
    console.log('Missing fields:', {
      email: !email,
      password: !password,
      confirmPassword: !confirmPassword,
      firstName: !firstName,
      lastName: !lastName,
      userType: !userType
    })
    redirect('/signup?error=All required fields must be filled')
  }

  if (!email.includes('@')) {
    console.log('Validation failed: Invalid email format')
    redirect('/signup?error=Please enter a valid email address')
  }

  if (password.length < 6) {
    console.log('Validation failed: Password too short')
    redirect('/signup?error=Password must be at least 6 characters long')
  }

  if (password !== confirmPassword) {
    console.log('Validation failed: Passwords do not match')
    redirect('/signup?error=Passwords do not match')
  }

  if (!['parent', 'teacher', 'school'].includes(userType)) {
    console.log('Validation failed: Invalid user type:', userType)
    redirect('/signup?error=Please select a valid user type')
  }

  console.log('Validation passed, creating user account...')

  try {
    // Create the user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          user_type: userType,
          phone: phone || null
        }
      }
    })

    if (error) {
      console.error('Supabase signup error:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      })
      
      if (error.message.includes('User already registered')) {
        redirect('/signup?error=An account with this email already exists')
      } else if (error.message.includes('Password should be at least')) {
        redirect('/signup?error=Password is too weak')
      } else if (error.message.includes('Unable to validate email address')) {
        redirect('/signup?error=Invalid email address format')
      } else {
        redirect(`/signup?error=Signup error: ${error.message}`)
      }
    }

    console.log('Supabase response:', { user: data.user?.id, session: !!data.session })

    if (data.user) {
      console.log('Signup successful for user:', data.user.email, 'ID:', data.user.id)
      
      // Try to create user profile in the profiles table (optional)
      try {
        console.log('Attempting to create profile...')
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            user_type: userType,
            phone: phone || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          console.log('Profile creation failed, but continuing with signup...')
        } else {
          console.log('Profile created successfully')
        }
      } catch (profileError) {
        console.error('Profile creation exception:', profileError)
        console.log('Profile creation failed, but continuing with signup...')
      }

      console.log('Redirecting to dashboard...')
      revalidatePath('/', 'layout')
      redirect('/dashboard?message=Account created successfully! Welcome to Tutelage Services.')
    } else {
      console.log('Signup failed: No user data returned from Supabase')
      console.log('Full response data:', data)
      redirect('/signup?error=Account creation failed - no user data returned')
    }
  } catch (error) {
    console.error('Signup exception:', error)
    console.error('Exception details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    // Check if this is a redirect error (which is expected)
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error // Re-throw redirect errors
    }
    
    redirect('/signup?error=An unexpected error occurred during signup')
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
