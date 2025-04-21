import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import RootLayoutClient from '@/components/RootLayoutClient'
import { NextAuthProvider } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StudyPlanner',
  description: 'Your personal study planning assistant',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </NextAuthProvider>
      </body>
    </html>
  )
} 