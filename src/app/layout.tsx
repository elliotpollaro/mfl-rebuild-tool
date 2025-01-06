import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Dynasty Trade Calculator',
  description: 'Calculate and propose dynasty fantasy football trades',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {children}
        <Toaster />
      </body>
    </html>
  )
} 