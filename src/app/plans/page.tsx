'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlanStore } from '@/lib/store'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function PlansPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { fetchPlans, isLoading, error, plans } = usePlanStore()
  const [mounted, setMounted] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  
  // 添加额外的错误处理状态
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    
    const loadPlans = async () => {
      // 如果用户已登录，获取其学习计划
      if (session?.user?.id) {
        try {
          console.log("Fetching plans for user:", session.user.id);
          const result = await fetchPlans(session.user.id);
          if (!result.success) {
            setFetchError(result.error || '加载计划失败');
          }
        } catch (error) {
          console.error("Error fetching plans:", error);
          setFetchError('加载计划时出错');
        }
      } else {
        console.log("No user session available yet:", status);
      }
      
      setSessionChecked(true);
    };
    
    if (status !== 'loading') {
      loadPlans();
    }
  }, [session, status, fetchPlans])
  
  // 检查会话状态是否发生变化
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      console.log("User authenticated, session:", session);
    } else if (status === 'unauthenticated') {
      console.log("User is not authenticated");
    }
  }, [status, session]);

  const calculateProgress = (tasks: any[]) => {
    if (!tasks || !Array.isArray(tasks)) return 0
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.completed).length
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  }

  // 处理计划卡片点击，添加额外的会话检查
  const handlePlanClick = (planId: string) => {
    console.log("Plan clicked, session status:", status);
    console.log("User info:", session?.user);
    
    // 如果会话还在加载中，显示加载状态
    if (status === 'loading') {
      console.log("Session is still loading");
      return;
    }
    
    // 确保会话已完全加载并且用户信息存在
    if (status !== 'authenticated' || !session?.user) {
      console.log("User not logged in, redirecting to login page");
      // 如果用户未登录，先保存目标URL，然后重定向到登录页
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', `/plan?id=${planId}`);
      }
      router.push('/login');
      return;
    }
    
    console.log("User is logged in, navigating to plan details");
    // 用户已登录，正常导航到计划详情页
    const plan = plans.find(p => (p._id === planId || p.id === planId));
    if (plan) {
      const planWithId = {
        ...plan,
        id: planId,
        _id: planId
      };
      usePlanStore.getState().setPlan(planWithId);
      router.push(`/plan?id=${planId}`);
    } else {
      console.error("Plan not found with ID:", planId);
      // 可以显示错误提示
    }
  };

  // 加载中状态
  if (status === 'loading' || !mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 pt-16">
      {/* 显示API调用错误 */}
      {(error || fetchError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error || fetchError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的学习计划</h1>
        <Button 
          asChild
          onClick={(e) => {
            // 如果未登录，先保存目标URL，然后重定向到登录页
            if (!session?.user) {
              e.preventDefault();
              localStorage.setItem('redirectAfterLogin', '/generate');
              router.push('/login');
            }
          }}
        >
          <Link href={session?.user ? "/generate" : "#"}>创建新计划</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !plans || plans.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">
              {session?.user ? '你还没有创建任何学习计划' : '登录后可查看您的学习计划'}
            </p>
            <Button 
              asChild
              onClick={(e) => {
                // 如果未登录，先保存目标URL，然后重定向到登录页
                if (!session?.user) {
                  e.preventDefault();
                  localStorage.setItem('redirectAfterLogin', '/generate');
                  router.push('/login');
                }
              }}
            >
              <Link href={session?.user ? "/generate" : "#"}>
                {session?.user ? '创建第一个计划' : '登录/注册'}
              </Link>
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
                onClick={() => handlePlanClick(planId)}
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
                      <p>开始日期：{plan.startDate || '未设置'}</p>
                      <p>结束日期：{plan.endDate || '未设置'}</p>
                      <p>每日学习时长：{plan.dailyHours || 0} 小时</p>
                    </div>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation(); // 阻止冒泡到卡片
                        handlePlanClick(planId);
                      }}
                      className="w-full"
                    >
                      查看详情
                    </Button>
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