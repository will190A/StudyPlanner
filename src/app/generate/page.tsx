'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { useAuthStore, usePlanStore } from '@/lib/store'

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography',
]

// Mock function to generate tasks (in a real app, this would be an API call)
const generateTasks = (subjects: string[], startDate: Date, endDate: Date, dailyHours: number) => {
  const tasks = []
  const currentDate = new Date(startDate)
  const end = new Date(endDate)
  const taskDescriptions = {
    Mathematics: ['Study calculus', 'Practice algebra', 'Review geometry'],
    Physics: ['Learn mechanics', 'Study electricity', 'Practice problem-solving'],
    Chemistry: ['Study organic chemistry', 'Review periodic table', 'Practice equations'],
    Biology: ['Study cell biology', 'Learn genetics', 'Review ecosystems'],
    'Computer Science': ['Practice coding', 'Study algorithms', 'Learn data structures'],
    English: ['Reading comprehension', 'Writing practice', 'Grammar review'],
    History: ['Study world history', 'Review important events', 'Learn about civilizations'],
    Geography: ['Study maps', 'Learn about climate', 'Review continents'],
  }

  while (currentDate <= end) {
    const dayTasks = subjects.map(subject => ({
      id: `${subject}-${currentDate.toISOString()}`,
      date: currentDate.toISOString(),
      subject,
      description: taskDescriptions[subject as keyof typeof taskDescriptions][
        Math.floor(Math.random() * 3)
      ],
      duration: Math.round((dailyHours / subjects.length) * 2) / 2,
      completed: false,
    }))
    tasks.push(...dayTasks)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return tasks
}

export default function GeneratePage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setPlan = usePlanStore((state) => state.setPlan)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [studyHours, setStudyHours] = useState<number>(4)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!startDate || !endDate || selectedSubjects.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    const tasks = generateTasks(selectedSubjects, startDate, endDate, studyHours)
    const plan = {
      id: Date.now().toString(),
      subjects: selectedSubjects,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      dailyHours: studyHours,
      tasks,
    }

    setPlan(plan)
    router.push('/plan')
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Generate Your Study Plan</CardTitle>
          <CardDescription>
            Fill in the details below to create your personalized study plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <Label>Subjects (select at least one)</Label>
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <Badge
                    key={subject}
                    variant={selectedSubjects.includes(subject) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => toggleSubject(subject)}
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Start Date</Label>
                <DatePicker date={startDate} setDate={setStartDate} />
              </div>
              <div className="space-y-4">
                <Label>End Date</Label>
                <DatePicker date={endDate} setDate={setEndDate} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Daily Study Hours</Label>
                <span className="text-sm text-gray-500">{studyHours} hours</span>
              </div>
              <Slider
                defaultValue={[4]}
                max={12}
                step={0.5}
                onValueChange={([value]) => setStudyHours(value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              disabled={selectedSubjects.length === 0 || !startDate || !endDate}
            >
              Generate Plan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 