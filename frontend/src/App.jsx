import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import { initSocket } from './utils/socket'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import GamesPage from './pages/GamesPage'
import GameRoom from './pages/GameRoom'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import TournamentsPage from './pages/TournamentsPage'
import FriendsPage from './pages/FriendsPage'
import ChatPage from './pages/ChatPage'
import MatchHistoryPage from './pages/MatchHistoryPage'
import NotificationsPage from './pages/NotificationsPage'
import Layout from './components/layout/Layout'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } })

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { isAuthenticated, token } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && token) initSocket(token)
  }, [isAuthenticated, token])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#111827', color: '#e2e8f0', border: '1px solid rgba(0,245,255,0.3)' },
            success: { iconTheme: { primary: '#00F5FF', secondary: '#050816' } },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="room/:roomCode" element={<GameRoom />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/:userId" element={<ProfilePage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="chat/:userId" element={<ChatPage />} />
            <Route path="history" element={<MatchHistoryPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
