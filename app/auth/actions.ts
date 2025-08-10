'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export async function login(formData: FormData) {
  try {
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
      revalidatePath('/', 'layout')
      redirect('/dashboard')
    }
  } catch (error) {
    console.error('Login error:', error)
    redirect('/login?error=Login failed')
  }
}

export async function signup(formData: FormData) {
  try {
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
      console.error('Signup error:', error)
      if (error.message.includes('User already registered')) {
        redirect('/signup?error=An account with this email already exists')
      } else if (error.message.includes('Password should be at least')) {
        redirect('/signup?error=Password is too weak')
      } else {
        redirect('/signup?error=Could not create account')
      }
    }

    if (data.user) {
      console.log('Signup successful for user:', data.user.email)
      
      // Create user profile in the profiles table
      try {
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
          // Don't fail the signup if profile creation fails
        }
      } catch (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail the signup if profile creation fails
      }

      revalidatePath('/', 'layout')
      redirect('/dashboard?message=Account created successfully! Welcome to Tutelage Services.')
    } else {
      console.log('Signup failed: No user data returned')
      redirect('/signup?error=Signup failed')
    }
  } catch (error) {
    console.error('Signup error:', error)
    redirect('/signup?error=Signup failed')
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
