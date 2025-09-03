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
  title: 'Tutelage Services - Leading Education Recruitment Agency',
  description: 'We are a leading education recruitment agency, helping teachers and support staff find their next role in schools across the UK.',
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
