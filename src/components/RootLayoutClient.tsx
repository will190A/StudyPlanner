'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/landing' || pathname === '/login' || pathname === '/register'

  return (
    <>
      {!isLandingPage && <Navbar />}
      <main className={isLandingPage ? '' : 'pt-16'}>
        {children}
      </main>
    </>
  )
} 