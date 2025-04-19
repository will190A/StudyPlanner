'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, usePlanStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function PlansPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { fetchPlans, isLoading, error, plans } = usePlanStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setMounted(true)
    if (user) {
      fetchPlans(user.id)
    }
  }, [isAuthenticated, router, user, fetchPlans])

  const calculateProgress = (tasks: any[]) => {
    if (!tasks || !Array.isArray(tasks)) return 0
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.completed).length
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  }

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的学习计划</h1>
        <Button asChild>
          <Link href="/generate">创建新计划</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !plans || plans.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">你还没有创建任何学习计划</p>
            <Button asChild>
              <Link href="/generate">创建第一个计划</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const planId = plan._id || plan.id
            if (!planId) return null
            
            return (
              <Card
                key={planId}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  const planWithId = {
                    ...plan,
                    id: planId
                  }
                  usePlanStore.getState().setPlan(planWithId)
                  router.push(`/plan?id=${planId}`)
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {Array.isArray(plan.subjects) ? plan.subjects.join('、') : '未设置科目'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>总体进度</span>
                        <span>{Math.round(calculateProgress(plan.tasks))}%</span>
                      </div>
                      <Progress value={calculateProgress(plan.tasks)} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">总任务数</p>
                        <p className="text-2xl font-bold">
                          {Array.isArray(plan.tasks) ? plan.tasks.length : 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">已完成任务</p>
                        <p className="text-2xl font-bold">
                          {Array.isArray(plan.tasks) 
                            ? plan.tasks.filter((task: any) => task.completed).length 
                            : 0}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>开始日期：{plan.startDate ? new Date(plan.startDate).toLocaleDateString() : '未设置'}</p>
                      <p>结束日期：{plan.endDate ? new Date(plan.endDate).toLocaleDateString() : '未设置'}</p>
                      <p>每日学习时长：{plan.dailyHours || 0} 小时</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 