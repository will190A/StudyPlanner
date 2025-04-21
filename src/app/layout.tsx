import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import RootLayoutClient from '@/components/RootLayoutClient'
import { NextAuthProvider } from '@/components/providers'
import { Toaster } from "@/components/ui/toaster"

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
        <Toaster />
      </body>
    </html>
  )
} 