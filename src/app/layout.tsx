import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StudyPlanner - Your AI Study Assistant',
  description: 'An AI-powered study planning platform to help you achieve your learning goals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
          {children}
        </main>
      </body>
    </html>
  )
} 