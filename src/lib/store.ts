import { create } from 'zustand'

interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: string
  department: string
  isActive: boolean
}

type ViewType = 'login' | 'dashboard' | 'users' | 'devices' | 'vulnerabilities' | 'solutions' | 'assessments' | 'audit-logs' | 'profile'

interface AppState {
  currentUser: User | null
  currentView: ViewType
  sidebarOpen: boolean
  darkMode: boolean
  setCurrentUser: (user: User | null) => void
  setCurrentView: (view: ViewType) => void
  setSidebarOpen: (open: boolean) => void
  toggleDarkMode: () => void
  setDarkMode: (dark: boolean) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  currentView: 'login',
  sidebarOpen: true,
  darkMode: false,
  setCurrentUser: (user) => set({ currentUser: user, currentView: user ? 'dashboard' : 'login' }),
  setCurrentView: (view) => set({ currentView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleDarkMode: () => set((state) => {
    const newDark = !state.darkMode
    if (typeof window !== 'undefined') {
      localStorage.setItem('nisaap-dark-mode', newDark ? 'true' : 'false')
    }
    return { darkMode: newDark }
  }),
  setDarkMode: (dark) => set({ darkMode: dark }),
  logout: () => set({ currentUser: null, currentView: 'login', sidebarOpen: true }),
}))
