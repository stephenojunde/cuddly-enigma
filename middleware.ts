import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Check if we have the required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables in middleware')
      // If accessing dashboard without proper config, redirect to login
      if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('error', 'configuration')
        url.searchParams.set('next', request.nextUrl.pathname + (request.nextUrl.search || ''))
        return NextResponse.redirect(url)
      }
      return NextResponse.next()
    }

    const response = NextResponse.next()

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    // Only check auth for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      console.log('Middleware checking dashboard access for:', user?.email || 'no user')
      
      if (error || !user) {
        console.log('Middleware: No user found, redirecting to login')
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('error', 'Please log in to access your dashboard')
        url.searchParams.set('next', request.nextUrl.pathname + (request.nextUrl.search || ''))
        return NextResponse.redirect(url)
      } else {
        console.log('Middleware: User authenticated, allowing dashboard access')
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // If there's an error and user is trying to access dashboard, redirect to login
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'auth_error')
      url.searchParams.set('next', request.nextUrl.pathname + (request.nextUrl.search || ''))
      return NextResponse.redirect(url)
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
