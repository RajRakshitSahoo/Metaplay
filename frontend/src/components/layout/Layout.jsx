import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiGrid, FiPlay, FiTrendingUp, FiUsers, FiMessageSquare,
  FiAward, FiClock, FiBell, FiUser, FiLogOut, FiMenu, FiX, FiStar
} from 'react-icons/fi'
import { GiTrophy, GiSwordman } from 'react-icons/gi'
import useAuthStore from '../../store/authStore'
import useGameStore from '../../store/gameStore'
import { getSocket, initSocket } from '../../utils/socket'
import { getRankColor } from '../../utils/constants'
import toast from 'react-hot-toast'
import api from '../../utils/api'

const NAV_ITEMS = [
  { path: '/app', label: 'Dashboard', icon: FiGrid, exact: true },
  { path: '/app/games', label: 'Games', icon: FiPlay },
  { path: '/app/leaderboard', label: 'Leaderboard', icon: FiTrendingUp },
  { path: '/app/tournaments', label: 'Tournaments', icon: GiTrophy },
  { path: '/app/friends', label: 'Friends', icon: FiUsers },
  { path: '/app/chat', label: 'Chat', icon: FiMessageSquare },
  { path: '/app/history', label: 'Match History', icon: FiClock },
  { path: '/app/notifications', label: 'Notifications', icon: FiBell },
  { path: '/app/profile', label: 'Profile', icon: FiUser },
]

import sound from "../../utils/gameSound"
export default function Layout() {
  const { user, logout, token, updateUser } = useAuthStore()
  const { onlinePlayers, setOnlinePlayers, incrementOnline, decrementOnline } = useGameStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return
    const socket = initSocket(token)

    socket.on('user:online', () => incrementOnline())
    socket.on('user:offline', () => decrementOnline())
    socket.on('xp:earned', ({ amount, reason }) => {
      toast.success(`+${amount} XP — ${reason}`, {
        icon: '⚡',
        style: { background: '#111827', color: '#00F5FF', border: '1px solid rgba(0,245,255,0.3)' },
      })
    })
    socket.on('achievement:unlocked', ({ name, icon }) => {
      toast.success(`Achievement Unlocked: ${icon} ${name}`, {
        duration: 5000,
        icon: '🏆',
      })
    })

    // Fetch notif count
    api.get('/notifications').then(({ data }) => {
      if (data.success) setNotifCount(data.notifications.filter(n => !n.isRead).length)
    }).catch(() => {})

    return () => {
      socket.off('user:online')
      socket.off('user:offline')
      socket.off('xp:earned')
      socket.off('achievement:unlocked')
    }
  }, [token])

  const handleLogout = async () => {
    await logout()
    toast.success('See you next time! 👋')
    navigate('/')
  }

  const xpPercent = user ? Math.round((user.xp / (user.xpToNextLevel || 100)) * 100) : 0

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'p-4' : 'p-4'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center font-cyber font-bold text-sm glow-cyan">M</div>
        <span className="font-cyber text-lg font-bold text-neon-cyan">META<span className="text-white">PLAY</span></span>
      </div>

      {/* User card */}
      {user && (
        <div className="card-glass rounded-xl p-3 mb-6 border border-neon-cyan/10">
          <div className="flex items-center gap-3 mb-3">
            <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.username} className="w-10 h-10 rounded-full border-2 border-neon-cyan/40" />
            <div className="flex-1 min-w-0">
              <div className="font-body font-bold text-white text-sm truncate">{user.username}</div>
              <div className="text-xs" style={{ color: getRankColor(user.rank) }}>{user.rank}</div>
            </div>
            <div className="text-right">
              <div className="font-cyber text-xs text-neon-cyan">Lv.{user.level}</div>
            </div>
          </div>
          {/* XP Bar */}
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full xp-bar-fill transition-all duration-1000"
              style={{ width: `${xpPercent}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-white/30 font-body">{user.xp} XP</span>
            <span className="text-xs text-white/30 font-body">{user.xpToNextLevel} needed</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
          <NavLink key={path} to={path} end={exact}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-semibold transition-all duration-200 relative group
              ${isActive ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`
            }>
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 ${isActive ? 'text-neon-cyan' : ''}`} />
                {label}
                {label === 'Notifications' && notifCount > 0 && (
                  <span className="ml-auto bg-neon-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-cyber">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Online counter */}
      <div className="px-3 py-2 mb-2">
        <div className="flex items-center gap-2 text-xs text-white/30 font-body">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          {(onlinePlayers || 0).toLocaleString()} online
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-semibold text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all">
        <FiLogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  )

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-bg-secondary/60 border-r border-white/5 flex-shrink-0 overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-bg-secondary z-50 lg:hidden overflow-y-auto">
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-bg-secondary/60 border-b border-white/5">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white p-1">
            <FiMenu className="w-6 h-6" />
          </button>
          <span className="font-cyber text-sm font-bold text-neon-cyan">METAPLAY</span>
          <NavLink to="/app/notifications" className="text-white/60 hover:text-white p-1 relative">
            <FiBell className="w-5 h-5" />
            {notifCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-neon-pink rounded-full" />}
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
