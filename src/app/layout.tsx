import type { Metadata } from 'next'
import './globals.css'
import RootLayoutClient from '@/components/RootLayoutClient'
import { Providers } from '@/components/providers'
import { Toaster } from "@/components/ui/toaster"

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
      <body className="font-sans">
        <Providers>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
} 