'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthStore } from '@/lib/store'
import { usePlanStore } from '@/lib/store'

export default function PlanPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const currentPlan = usePlanStore((state) => state.currentPlan)
  const updateTask = usePlanStore((state) => state.updateTask)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!currentPlan) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No Study Plan Found</h2>
            <p className="text-gray-600 mb-6">You haven't created a study plan yet.</p>
            <Button
              onClick={() => router.push('/generate')}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Create New Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completedTasks = currentPlan.tasks.filter((task) => task.completed).length
  const totalTasks = currentPlan.tasks.length
  const progress = Math.round((completedTasks / totalTasks) * 100)

  // Group tasks by date
  const tasksByDate = currentPlan.tasks.reduce((acc, task) => {
    const date = task.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(task)
    return acc
  }, {} as Record<string, typeof currentPlan.tasks>)

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Study Plan</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/generate')}
          >
            Edit Plan
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progress}% Complete</span>
                <span>{completedTasks}/{totalTasks} Tasks</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {Object.entries(tasksByDate).map(([date, tasks]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle>{new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-4">
                      <Checkbox
                        id={task.id}
                        checked={task.completed}
                        onCheckedChange={(checked) => updateTask(task.id, checked as boolean)}
                      />
                      <div className="space-y-1">
                        <label
                          htmlFor={task.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {task.subject}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {task.description} ({task.duration} hours)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 