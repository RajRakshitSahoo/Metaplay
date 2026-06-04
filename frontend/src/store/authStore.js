import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// zustand v4 persist middleware
import api from '../utils/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          if (data.success) {
            localStorage.setItem('metaplay_token', data.token)
            set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
            return { success: true }
          }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Login failed' }
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', { username, email, password })
          if (data.success) {
            localStorage.setItem('metaplay_token', data.token)
            set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
            return { success: true }
          }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Registration failed' }
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout') } catch {}
        localStorage.removeItem('metaplay_token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (userData) => set(state => ({ user: { ...state.user, ...userData } })),

      refreshUser: async () => {
        try {
          const { data } = await api.get('/auth/me')
          if (data.success) set({ user: data.user })
        } catch {}
      },
    }),
    { name: 'metaplay-auth', partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }) }
  )
)

export default useAuthStore
