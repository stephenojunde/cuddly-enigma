'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Check if current path should have a clean layout (no header/footer)
  const isCleanLayoutRoute = pathname?.startsWith('/dashboard') || 
                            pathname?.startsWith('/userdashboard') ||
                            pathname?.startsWith('/login') ||
                            pathname?.startsWith('/signup') ||
                            pathname?.startsWith('/auth/')
  
  if (isCleanLayoutRoute) {
    // Dashboard and auth pages: no header/footer, no padding
    return <>{children}</>
  }
  
  // Regular pages: include header/footer with padding
  return (
    <div className="pt-14">
      <Header />
      {children}
      <Footer />
    </div>
  )
}

export default ConditionalLayout