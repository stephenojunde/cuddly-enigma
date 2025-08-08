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
      } else if (error.message.includes('Email not confirmed')) {
        redirect('/login?error=Please check your email and confirm your account')
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

    // Basic validation
    if (!email || !password || !confirmPassword) {
      redirect('/signup?error=All fields are required')
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
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
      revalidatePath('/', 'layout')
      redirect('/login?message=Check your email to confirm your account before signing in')
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
