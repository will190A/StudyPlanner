'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, usePlanStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

const subjects = [
  '数学',
  '英语',
  '物理',
  '化学',
  '生物',
  '历史',
  '地理',
  '政治',
]

export default function GeneratePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { savePlan, updatePlan, isLoading, error } = usePlanStore()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date
  })
  const [dailyHours, setDailyHours] = useState(2)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const generateTasks = () => {
    const tasks = []
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const hoursPerSubject = (dailyHours * days) / selectedSubjects.length

    selectedSubjects.forEach((subject) => {
      const subjectHours = Math.ceil(hoursPerSubject)
      const tasksPerSubject = Math.ceil(subjectHours / 2) // 每个任务2小时

      for (let i = 0; i < tasksPerSubject; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + Math.floor((i * days) / tasksPerSubject))
        
        tasks.push({
          id: `${subject}-${i}`,
          date: date.toISOString().split('T')[0],
          subject,
          description: `${subject} 学习任务 ${i + 1}`,
          duration: 2,
          completed: false,
        })
      }
    })

    return tasks
  }

  const handleSubmit = async () => {
    if (selectedSubjects.length === 0) {
      return
    }

    setIsSubmitting(true)
    try {
      const tasks = generateTasks()
      const plan = {
        userId: user?.id,
        subjects: selectedSubjects,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dailyHours,
        tasks,
      }

      const result = await savePlan(plan)
      if (result.success) {
        router.push('/plan')
      } else {
        console.error('Failed to save plan:', result.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>创建学习计划</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label>选择科目</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {subjects.map((subject) => (
                  <Button
                    key={subject}
                    variant={selectedSubjects.includes(subject) ? 'default' : 'outline'}
                    onClick={() => {
                      if (selectedSubjects.includes(subject)) {
                        setSelectedSubjects(selectedSubjects.filter((s) => s !== subject))
                      } else {
                        setSelectedSubjects([...selectedSubjects, subject])
                      }
                    }}
                    disabled={isLoading || isSubmitting}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>开始日期</Label>
                <DatePicker
                  date={startDate}
                  setDate={setStartDate}
                  disabled={isLoading || isSubmitting}
                />
              </div>
              <div>
                <Label>结束日期</Label>
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                  disabled={isLoading || isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label>每日学习时长（小时）</Label>
              <div className="flex items-center space-x-4 mt-2">
                <Slider
                  value={[dailyHours]}
                  onValueChange={([value]) => setDailyHours(value)}
                  min={1}
                  max={8}
                  step={0.5}
                  disabled={isLoading || isSubmitting}
                />
                <span className="text-sm font-medium">{dailyHours} 小时</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={selectedSubjects.length === 0 || isLoading || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  '生成学习计划'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 