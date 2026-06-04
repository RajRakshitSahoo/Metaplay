import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FiTrendingUp, FiAward, FiZap } from 'react-icons/fi'
import api from '../utils/api'
import { getRankColor } from '../utils/constants'
import useAuthStore from '../store/authStore'

const TABS = [{ id: 'xp', label: 'Top XP', icon: FiZap }, { id: 'wins', label: 'Top Wins', icon: FiAward }]

export default function LeaderboardPage() {
  const [tab, setTab] = useState('xp')
  const { user } = useAuthStore()

  const { data: xpData, isLoading: xpLoading } = useQuery({
    queryKey: ['leaderboard-xp'],
    queryFn: () => api.get('/leaderboard/global').then(r => r.data.leaderboard),
  })
  const { data: winData, isLoading: winLoading } = useQuery({
    queryKey: ['leaderboard-wins'],
    queryFn: () => api.get('/leaderboard/wins').then(r => r.data.leaderboard),
  })

  const data = tab === 'xp' ? xpData : winData
  const loading = tab === 'xp' ? xpLoading : winLoading

  const getRankIcon = (i) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `#${i + 1}`
  }

  const myRank = data?.findIndex(p => p._id === user?._id)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-cyber text-3xl font-bold text-white mb-1">
          <span className="text-neon-yellow text-neon-glow">LEADERBOARD</span>
        </h1>
        <p className="text-white/40 font-body text-sm">The best players on MetaPlay</p>
      </motion.div>

      {/* My rank */}
      {myRank !== undefined && myRank >= 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card-glass rounded-xl p-4 mb-6 border border-neon-cyan/20 flex items-center gap-4">
          <div className="font-cyber text-2xl text-neon-cyan">#{myRank + 1}</div>
          <div className="text-sm text-white/60 font-body">Your global ranking</div>
          <div className="ml-auto font-cyber text-sm text-neon-cyan">
            {tab === 'xp' ? `${(user?.xp || 0).toLocaleString()} XP` : `${user?.stats?.wins || 0} wins`}
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-cyber text-sm transition-all border
            ${tab === t.id ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {data && data.length >= 3 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-center gap-4 mb-8">
          {[data[1], data[0], data[2]].map((player, i) => {
            const actualRank = [1, 0, 2][i]
            const heights = ['h-28', 'h-36', 'h-24']
            const colors = ['#C0C0C0', '#FFD700', '#CD7F32']
            const labels = ['2nd', '1st', '3rd']
            return (
              <Link to={`/app/profile/${player._id}`} key={player._id}
                className={`flex flex-col items-center gap-2 ${heights[i]} justify-end`}>
                <img src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}
                  alt={player.username} className="w-12 h-12 rounded-full border-2"
                  style={{ borderColor: colors[i] }} />
                <div className="text-sm font-body font-bold text-white">{player.username}</div>
                <div className="px-6 py-2 rounded-t-lg text-center w-full"
                  style={{ background: `${colors[i]}20`, borderBottom: `3px solid ${colors[i]}` }}>
                  <div className="text-lg">{labels[i] === '1st' ? '🥇' : labels[i] === '2nd' ? '🥈' : '🥉'}</div>
                  <div className="font-cyber text-xs mt-1" style={{ color: colors[i] }}>
                    {tab === 'xp' ? `${(player.xp || 0).toLocaleString()}` : `${player.stats?.wins || 0}W`}
                  </div>
                </div>
              </Link>
            )
          })}
        </motion.div>
      )}

      {/* Full list */}
      <div className="card-glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="cyber-spinner" />
          </div>
        ) : (
          data?.map((player, i) => (
            <motion.div key={player._id} initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5) }}
              className={`flex items-center gap-4 px-5 py-4 border-b border-white/5 hover:bg-white/3 transition-colors
              ${player._id === user?._id ? 'bg-neon-cyan/5 border-l-2 border-l-neon-cyan' : ''}`}>
              <div className={`w-8 text-center font-cyber font-bold text-sm
                ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-white/30'}`}>
                {getRankIcon(i)}
              </div>
              <img src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}
                alt="" className="w-9 h-9 rounded-full border border-white/10" />
              <div className="flex-1">
                <Link to={`/app/profile/${player._id}`}
                  className="font-body font-bold text-white hover:text-neon-cyan transition-colors">
                  {player.username} {player._id === user?._id && <span className="text-neon-cyan text-xs">(You)</span>}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: getRankColor(player.rank) }}>{player.rank}</span>
                  <span className="text-white/20 text-xs">•</span>
                  <span className="text-xs text-white/30 font-body">Lv.{player.level}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-cyber text-sm text-neon-cyan">
                  {tab === 'xp' ? `${(player.xp || 0).toLocaleString()} XP` : `${player.stats?.wins || 0} wins`}
                </div>
                <div className="text-xs text-white/30">{player.stats?.gamesPlayed || 0} games</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
