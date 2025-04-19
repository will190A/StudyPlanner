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
  const { savePlan, updatePlan, isLoading: isPlanLoading, error } = usePlanStore()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date
  })
  const [dailyHours, setDailyHours] = useState(2)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)

    try {
      console.log('Starting plan generation...')
      // 生成 AI 计划
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjects: selectedSubjects,
          startDate: startDate.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
          endDate: endDate.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
          dailyHours,
        }),
      });

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '生成计划失败')
      }

      console.log('Plan generated, saving...')
      const { tasks } = data

      // 保存计划
      const result = await savePlan({
        userId: user?.id || '',
        subjects: selectedSubjects,
        startDate: startDate.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
        endDate: endDate.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
        dailyHours,
        tasks
      })

      console.log('Save plan result:', result)

      if (result.success && result.data) {
        console.log('Plan saved successfully:', result.data)
        // 跳转到全部学习计划页面
        router.push('/plans')
      } else {
        console.error('Failed to save plan:', result.error)
        throw new Error(result.error || '保存计划失败')
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setError(error instanceof Error ? error.message : '创建计划时发生错误')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex items-center">
            <span className="mr-2">⚠️</span>
            {errorMessage}
          </AlertDescription>
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
                    disabled={isGenerating || isSubmitting}
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
                  disabled={isGenerating || isSubmitting}
                />
              </div>
              <div>
                <Label>结束日期</Label>
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                  disabled={isGenerating || isSubmitting}
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
                  disabled={isGenerating || isSubmitting}
                />
                <span className="text-sm font-medium">{dailyHours} 小时</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={selectedSubjects.length === 0 || isGenerating || isSubmitting}
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在生成计划...
                  </div>
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