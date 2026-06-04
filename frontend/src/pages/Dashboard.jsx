import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiAward, FiPlay, FiUsers, FiZap, FiClock } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import { getRankColor } from '../utils/constants'

const QUICK_GAMES = [
  { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: '⭕', color: '#00F5FF', desc: 'Quick 2-player' },
  { id: 'chess', name: 'Chess', icon: '♟️', color: '#F59E0B', desc: 'Strategy battle' },
  { id: 'connectfour', name: 'Connect Four', icon: '🔴', color: '#FF6B6B', desc: 'Drop & connect' },
  { id: 'ludo', name: 'Ludo', icon: '🎲', color: '#22D3EE', desc: '2-4 players' },
  { id: 'reaction', name: 'Reaction Test', icon: '⚡', color: '#FBBF24', desc: 'Solo challenge' },
  { id: 'typing', name: 'Typing Battle', icon: '⌨️', color: '#60A5FA', desc: 'Speed test' },
]

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}
      className="card-glass rounded-xl p-5 border border-white/5 hover:border-white/15 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ background: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="font-cyber text-2xl font-bold text-white mb-1">{value ?? '—'}</div>
      <div className="text-sm text-white/50 font-body">{label}</div>
      {sub && <div className="text-xs text-white/30 mt-1 font-body">{sub}</div>}
    </motion.div>
  )
}

export default function Dashboard() {
  const { user, refreshUser } = useAuthStore()
  const [greeting, setGreeting] = useState('')
  const [liveUser, setLiveUser] = useState(null)

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening')
    // Refresh user to get latest stats
    refreshUser().then(() => {}).catch(() => {})
  }, [])

  // Live user data from API
  const { data: meData } = useQuery({
    queryKey: ['me-dashboard'],
    queryFn: () => api.get('/auth/me').then(r => r.data.user),
    refetchInterval: 10000,
  })

  useEffect(() => {
    if (meData) setLiveUser(meData)
  }, [meData])

  const displayUser = liveUser || user

  const { data: leaderData } = useQuery({
    queryKey: ['leaderboard-top'],
    queryFn: () => api.get('/leaderboard/global').then(r => r.data.leaderboard?.slice(0, 5)),
    refetchInterval: 30000,
  })

  const { data: historyData } = useQuery({
    queryKey: ['match-history-recent'],
    queryFn: () => api.get('/matchhistory/me').then(r => r.data.matches?.slice(0, 5)),
    refetchInterval: 10000,
  })

  const xpPercent = displayUser
    ? Math.min(100, Math.round(((displayUser.xp || 0) / (displayUser.xpToNextLevel || 100)) * 100))
    : 0

  const getResultColor = (result) => {
    if (result === 'win') return 'text-green-400'
    if (result === 'loss') return 'text-red-400'
    return 'text-yellow-400'
  }

  const getGameEmoji = (game) => {
    const map = {
      chess:'♟️', ludo:'🎲', tictactoe:'⭕', connectfour:'🔴',
      memory:'🃏', typing:'⌨️', reaction:'⚡', rps:'✂️',
      battleship:'🚢', sudoku:'🔢', minesweeper:'💣', '2048':'🎯',
      checkers:'🔵', gomoku:'⚫', dots:'📦', territory:'🗺️',
    }
    return map[game?.toLowerCase()] || '🎮'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/40 text-sm font-body">{greeting},</p>
            <h1 className="font-cyber text-3xl font-bold text-white">
              {displayUser?.username} <span className="text-neon-cyan text-neon-glow">⚡</span>
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-sm font-body" style={{ color: getRankColor(displayUser?.rank) }}>
                {displayUser?.rank || 'Bronze'}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-sm text-white/40 font-body">{displayUser?.playerLevel || 'Rookie'}</span>
              <span className="text-white/20">•</span>
              <span className="text-sm text-neon-cyan font-cyber">Level {displayUser?.level || 1}</span>
            </div>
          </div>
          <Link to="/app/games" className="btn-neon text-xs py-2.5 px-5">🎮 Play Now</Link>
        </div>

        {/* XP Progress */}
        <div className="mt-4 max-w-md">
          <div className="flex justify-between text-xs font-body text-white/40 mb-1">
            <span>{displayUser?.xp || 0} / {displayUser?.xpToNextLevel || 100} XP</span>
            <span>Level {displayUser?.level || 1} → {(displayUser?.level || 1) + 1}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
            />
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FiPlay} label="Games Played"
          value={displayUser?.stats?.gamesPlayed || 0} color="#00F5FF" />
        <StatCard icon={FiTrendingUp} label="Win Rate"
          value={`${displayUser?.stats?.winRate || 0}%`} color="#34D399"
          sub={`${displayUser?.stats?.wins || 0}W / ${displayUser?.stats?.losses || 0}L`} />
        <StatCard icon={FiZap} label="Total XP"
          value={(displayUser?.xp || 0).toLocaleString()} color="#F59E0B" />
        <StatCard icon={FiUsers} label="Friends"
          value={displayUser?.friends?.length || 0} color="#A78BFA" />
      </div>

      {/* Quick Play */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-cyber text-lg font-bold text-white">QUICK PLAY</h2>
          <Link to="/app/games" className="text-xs text-neon-cyan font-cyber hover:text-neon-cyan/70 transition-colors">
            All Games →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_GAMES.map((game, i) => (
            <motion.div key={game.id}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.05, y: -3 }}>
              <Link to="/app/games" state={{ selectedGame: game.id }}
                className="block card-glass rounded-xl p-4 text-center hover:border-white/20 border border-white/5 transition-all group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{game.icon}</div>
                <div className="font-body font-bold text-white text-xs mb-1">{game.name}</div>
                <div className="text-xs text-white/30">{game.desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cyber text-lg font-bold text-white">TOP PLAYERS</h2>
            <Link to="/app/leaderboard" className="text-xs text-neon-cyan font-cyber">View All →</Link>
          </div>
          <div className="card-glass rounded-xl overflow-hidden">
            {leaderData?.length ? leaderData.map((player, i) => (
              <div key={player._id}
                className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors
                ${player._id === displayUser?._id ? 'bg-neon-cyan/5 border-l-2 border-l-neon-cyan' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-cyber font-bold text-xs
                  ${i === 0 ? 'bg-yellow-500/20 text-yellow-400'
                  : i === 1 ? 'bg-slate-400/20 text-slate-300'
                  : i === 2 ? 'bg-orange-600/20 text-orange-400'
                  : 'bg-white/5 text-white/40'}`}>
                  {i + 1}
                </div>
                <img
                  src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}
                  alt="" className="w-8 h-8 rounded-full border border-white/10"
                  onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${player.username}` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-body font-bold text-white text-sm truncate">
                    {player.username}
                    {player._id === displayUser?._id && <span className="text-neon-cyan text-xs ml-1">(You)</span>}
                  </div>
                  <div className="text-xs" style={{ color: getRankColor(player.rank) }}>{player.rank}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-cyber text-xs text-neon-cyan">{(player.xp || 0).toLocaleString()}</div>
                  <div className="text-xs text-white/30">Lv.{player.level}</div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-white/30 font-body text-sm">
                {leaderData === undefined ? 'Loading...' : 'No players yet'}
              </div>
            )}
          </div>
        </div>

        {/* Recent matches */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cyber text-lg font-bold text-white">RECENT MATCHES</h2>
            <Link to="/app/history" className="text-xs text-neon-cyan font-cyber">View All →</Link>
          </div>
          <div className="card-glass rounded-xl overflow-hidden">
            {historyData?.length ? historyData.map((match) => {
              const myPlayer = match.players?.find(p =>
                p.user === displayUser?._id || p.user?.toString() === displayUser?._id?.toString()
              )
              const result = match.isDraw ? 'draw' : myPlayer?.result || 'unknown'
              const opponent = match.players?.find(p =>
                p.user !== displayUser?._id && p.user?.toString() !== displayUser?._id?.toString()
              )
              return (
                <div key={match._id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0
                    ${result === 'win' ? 'bg-green-400' : result === 'loss' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                  <span className="text-xl flex-shrink-0">{getGameEmoji(match.game)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-body font-semibold text-white text-sm capitalize">{match.game || 'Game'}</div>
                    <div className="text-xs text-white/30 truncate">
                      {opponent?.username ? `vs ${opponent.username} · ` : ''}
                      {match.createdAt ? new Date(match.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`font-cyber text-xs font-bold ${getResultColor(result)}`}>
                      {result.toUpperCase()}
                    </div>
                    <div className="text-xs text-neon-cyan font-cyber">+{match.xpAwarded || 10} XP</div>
                  </div>
                </div>
              )
            }) : (
              <div className="p-8 text-center">
                <div className="text-3xl mb-2">🎮</div>
                <p className="text-white/30 font-body text-sm">No matches yet. Start playing!</p>
                <Link to="/app/games" className="mt-3 inline-block text-xs text-neon-cyan font-cyber hover:text-neon-cyan/70">
                  Play Now →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-cyber text-lg font-bold text-white">ACHIEVEMENTS</h2>
          <Link to="/app/profile" className="text-xs text-neon-cyan font-cyber">View Profile →</Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {[
            { icon:'🩸', label:'First Win', need: 1 },
            { icon:'🎯', label:'10 Wins', need: 10 },
            { icon:'⚔️', label:'50 Wins', need: 50 },
            { icon:'💯', label:'100 Wins', need: 100 },
            { icon:'🔥', label:'500 Wins', need: 500 },
            { icon:'🏆', label:'Champion', need: 0 },
            { icon:'♟️', label:'Chess Master', need: 0 },
            { icon:'⌨️', label:'Typist', need: 0 },
            { icon:'📅', label:'Streak', need: 0 },
            { icon:'👑', label:'Legend', need: 0 },
            { icon:'🦋', label:'Social', need: 0 },
            { icon:'⭐', label:'Level 10', need: 0 },
          ].map((ach, i) => {
            const wins = displayUser?.stats?.wins || 0
            const unlocked = ach.need > 0 ? wins >= ach.need : false
            return (
              <motion.div key={i} whileHover={{ scale: 1.15 }} title={ach.label}
                className={`card-glass rounded-xl p-2 text-center border transition-all
                ${unlocked ? 'border-neon-yellow/40 bg-neon-yellow/5' : 'border-white/5 opacity-30 grayscale'}`}>
                <div className="text-2xl">{ach.icon}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
