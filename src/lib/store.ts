import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface StudyPlan {
  id: string
  subjects: string[]
  startDate: string
  endDate: string
  dailyHours: number
  tasks: {
    id: string
    date: string
    subject: string
    description: string
    duration: number
    completed: boolean
  }[]
}

interface PlanState {
  currentPlan: StudyPlan | null
  setPlan: (plan: StudyPlan) => void
  updateTask: (taskId: string, completed: boolean) => void
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      currentPlan: null,
      setPlan: (plan) => set({ currentPlan: plan }),
      updateTask: (taskId, completed) =>
        set((state) => ({
          currentPlan: state.currentPlan
            ? {
                ...state.currentPlan,
                tasks: state.currentPlan.tasks.map((task) =>
                  task.id === taskId ? { ...task, completed } : task
                ),
              }
            : null,
        })),
    }),
    {
      name: 'plan-storage',
    }
  )
) 