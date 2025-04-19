'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"

export function Navbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) return null

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/plans" className="font-semibold">
            学习计划
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            退出登录
          </Button>
        </div>
      </div>
    </nav>
  )
} 