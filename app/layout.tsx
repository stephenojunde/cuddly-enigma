import { Poppins, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ConditionalLayout } from '@/components/conditional-layout'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-playfair'
})

export const metadata = {
  title: 'Tutelage Services - Supply Teachers & Cover Supervisors',
  description: 'Prompt, dependable supply teachers and cover supervisors for educational institutions. We respond quickly to ensure smooth continuity of learning with minimal disruption.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body className="font-poppins bg-white antialiased">
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  )
}
