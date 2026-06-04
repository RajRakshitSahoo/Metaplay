import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { FiEdit2, FiUserPlus, FiMessageSquare, FiAward, FiTrendingUp, FiClock, FiPlay, FiSave, FiX } from 'react-icons/fi'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend
} from 'chart.js'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import { getRankColor, formatDate } from '../utils/constants'
import toast from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const RARITY_COLORS = { common: '#94a3b8', rare: '#60a5fa', epic: '#a78bfa', legendary: '#fbbf24' }

const ACHIEVEMENT_DEFS = [
  { key: 'first_win', name: 'First Blood', icon: '🩸', rarity: 'common', desc: 'Win your first match' },
  { key: 'wins_10', name: 'On a Roll', icon: '🎯', rarity: 'common', desc: 'Win 10 matches' },
  { key: 'wins_50', name: 'Veteran', icon: '⚔️', rarity: 'rare', desc: 'Win 50 matches' },
  { key: 'wins_100', name: 'Century', icon: '💯', rarity: 'epic', desc: 'Win 100 matches' },
  { key: 'wins_500', name: 'Unstoppable', icon: '🔥', rarity: 'legendary', desc: 'Win 500 matches' },
  { key: 'tournament_win', name: 'Champion', icon: '🏆', rarity: 'epic', desc: 'Win a tournament' },
  { key: 'chess_master', name: 'Chess Master', icon: '♟️', rarity: 'rare', desc: 'Win 20 chess games' },
  { key: 'typing_champion', name: 'Type Master', icon: '⌨️', rarity: 'epic', desc: 'Reach 100 WPM' },
  { key: 'streak_7', name: 'Week Warrior', icon: '📅', rarity: 'rare', desc: '7-day login streak' },
  { key: 'legendary_player', name: 'Legendary', icon: '👑', rarity: 'legendary', desc: 'Reach Legend rank' },
  { key: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', rarity: 'common', desc: 'Add 10 friends' },
  { key: 'level_10', name: 'Rising Star', icon: '⭐', rarity: 'common', desc: 'Reach Level 10' },
]

export default function ProfilePage() {
  const { userId } = useParams()
  const { user: me, refreshUser } = useAuthStore()
  const [editMode, setEditMode] = useState(false)
  const [bio, setBio] = useState('')
  const [activeTab, setActiveTab] = useState('stats')
  const [saving, setSaving] = useState(false)

  const isOwn = !userId || userId === me?._id
  const targetId = userId || me?._id

  const { data: profile, refetch, isLoading, isError } = useQuery({
    queryKey: ['profile', targetId],
    queryFn: async () => {
      if (!targetId) return me
      const endpoint = isOwn ? '/auth/me' : `/users/${targetId}`
      const { data } = await api.get(endpoint)
      return data.user
    },
    enabled: !!targetId,
    retry: 1,
  })

  const { data: historyData } = useQuery({
    queryKey: ['history', targetId],
    queryFn: () => api.get(`/matchhistory/user/${targetId}`).then(r => r.data.matches),
    enabled: !!targetId,
    retry: 1,
  })

  useEffect(() => {
    if (profile?.bio !== undefined) setBio(profile.bio || '')
  }, [profile])

  const saveBio = async () => {
    setSaving(true)
    try {
      await api.put('/auth/profile', { bio })
      toast.success('Profile updated!')
      setEditMode(false)
      refetch()
      refreshUser()
    } catch {
      toast.error('Failed to update')
    }
    setSaving(false)
  }

  const sendFriendRequest = async () => {
    try {
      await api.post(`/friends/request/${targetId}`)
      toast.success('Friend request sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const displayProfile = profile || me
  const xpPct = displayProfile
    ? Math.round((displayProfile.xp / (displayProfile.xpToNextLevel || 100)) * 100)
    : 0

  // Determine unlocked achievements based on stats
  const getUnlockedAchs = () => {
    if (!displayProfile) return new Set()
    const wins = displayProfile.stats?.wins || 0
    const unlocked = new Set()
    if (wins >= 1) unlocked.add('first_win')
    if (wins >= 10) unlocked.add('wins_10')
    if (wins >= 50) unlocked.add('wins_50')
    if (wins >= 100) unlocked.add('wins_100')
    if (wins >= 500) unlocked.add('wins_500')
    if ((displayProfile.friends?.length || 0) >= 10) unlocked.add('social_butterfly')
    if ((displayProfile.level || 1) >= 10) unlocked.add('level_10')
    return unlocked
  }
  const unlockedAchs = getUnlockedAchs()

  const gameLabels = ['Chess', 'Ludo', 'TicTacToe', 'Connect4', 'Memory', 'Typing']
  const barData = {
    labels: gameLabels,
    datasets: [{
      label: 'Wins',
      data: gameLabels.map(() => Math.floor(Math.random() * Math.max(1, displayProfile?.stats?.wins || 1))),
      backgroundColor: 'rgba(0,245,255,0.4)',
      borderColor: '#00F5FF',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Rajdhani' } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Rajdhani' } }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="cyber-spinner" />
    </div>
  )

  if (isError || !displayProfile) return (
    <div className="p-6 text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <p className="text-white/50 font-body">Could not load profile. <button onClick={refetch} className="text-neon-cyan underline">Retry</button></p>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card-glass rounded-2xl overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-neon-purple/30 via-neon-cyan/20 to-neon-pink/20 relative">
            <div className="absolute inset-0 cyber-bg opacity-30" />
          </div>

          <div className="px-6 pb-6 relative">
            <div className="flex items-end gap-4 -mt-10 mb-4 flex-wrap">
              <div className="relative">
                <img
                  src={displayProfile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayProfile.username}`}
                  alt="" className="w-20 h-20 rounded-full border-4 border-bg-primary bg-bg-secondary"
                  onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${displayProfile.username}` }}
                />
                <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-bg-primary"
                  style={{ background: displayProfile.status === 'online' ? '#4ade80' : '#6b7280' }} />
              </div>
              <div className="flex-1 mt-12">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-cyber text-2xl font-bold text-white">{displayProfile.username}</h1>
                  <span className="text-sm font-cyber font-bold px-2 py-0.5 rounded"
                    style={{ color: getRankColor(displayProfile.rank), background: `${getRankColor(displayProfile.rank)}15`, border: `1px solid ${getRankColor(displayProfile.rank)}30` }}>
                    {displayProfile.rank || 'Bronze'}
                  </span>
                  <span className="text-xs text-white/40 font-body">{displayProfile.playerLevel || 'Rookie'}</span>
                </div>
                {editMode ? (
                  <div className="flex gap-2 mt-2">
                    <input value={bio} onChange={e => setBio(e.target.value)} maxLength={200}
                      className="input-cyber text-sm flex-1" placeholder="Write your bio..." />
                    <button onClick={saveBio} disabled={saving}
                      className="btn-neon text-xs py-1.5 px-3 flex items-center gap-1">
                      <FiSave className="w-3 h-3" /> {saving ? '...' : 'Save'}
                    </button>
                    <button onClick={() => setEditMode(false)} className="text-white/40 hover:text-white p-1">
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-white/50 text-sm font-body mt-1">
                    {displayProfile.bio || (isOwn ? 'Click edit to add a bio...' : 'No bio yet.')}
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-12">
                {isOwn ? (
                  <button onClick={() => setEditMode(!editMode)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-cyber border border-white/20 text-white/60 hover:border-neon-cyan/40 hover:text-neon-cyan rounded transition-all">
                    <FiEdit2 className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <>
                    <button onClick={sendFriendRequest}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-cyber border border-neon-cyan/30 text-neon-cyan rounded hover:bg-neon-cyan/10 transition-all">
                      <FiUserPlus className="w-3 h-3" /> Add Friend
                    </button>
                    <a href={`/app/chat/${targetId}`}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-cyber border border-white/20 text-white/60 rounded hover:border-white/40 transition-all">
                      <FiMessageSquare className="w-3 h-3" /> Message
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* XP bar */}
            <div className="mt-2 max-w-sm">
              <div className="flex justify-between text-xs text-white/30 mb-1 font-body">
                <span>Level {displayProfile.level || 1}</span>
                <span>{displayProfile.xp || 0}/{displayProfile.xpToNextLevel || 100} XP</span>
              </div>
              <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full transition-all duration-1000"
                  style={{ width: `${xpPct}%` }} />
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { icon: FiPlay, label: 'Games', value: displayProfile.stats?.gamesPlayed || 0 },
                { icon: FiTrendingUp, label: 'Wins', value: displayProfile.stats?.wins || 0 },
                { icon: FiAward, label: 'Win Rate', value: `${displayProfile.stats?.winRate || 0}%` },
                { icon: FiClock, label: 'Friends', value: displayProfile.friends?.length || 0 },
              ].map(s => (
                <div key={s.label} className="text-center p-2 bg-white/3 rounded-lg">
                  <div className="font-cyber text-lg text-neon-cyan">{s.value}</div>
                  <div className="text-xs text-white/30 font-body">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['stats','Stats'],['achievements','Achievements'],['history','Match History']].map(([id,label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-cyber transition-all border
            ${activeTab === id ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="card-glass rounded-xl p-5">
            <h3 className="font-cyber text-sm text-white/50 tracking-widest mb-4">WINS BY GAME (Estimated)</h3>
            <Bar data={barData} options={chartOptions} height={80} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Games Played', value: displayProfile.stats?.gamesPlayed || 0, color: '#00F5FF' },
              { label: 'Total Wins', value: displayProfile.stats?.wins || 0, color: '#4ade80' },
              { label: 'Total Losses', value: displayProfile.stats?.losses || 0, color: '#f87171' },
              { label: 'Draws', value: displayProfile.stats?.draws || 0, color: '#fbbf24' },
            ].map(s => (
              <div key={s.label} className="card-glass rounded-xl p-4 text-center">
                <div className="font-cyber text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-white/40 font-body mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'achievements' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {ACHIEVEMENT_DEFS.map(ach => {
              const unlocked = unlockedAchs.has(ach.key)
              return (
                <motion.div key={ach.key} whileHover={{ scale: 1.05 }}
                  className={`card-glass rounded-xl p-4 text-center border transition-all ${unlocked ? '' : 'opacity-30 grayscale'}`}
                  style={{ borderColor: unlocked ? `${RARITY_COLORS[ach.rarity]}40` : 'rgba(255,255,255,0.05)' }}>
                  <div className="text-4xl mb-2">{ach.icon}</div>
                  <div className="font-body font-bold text-white text-sm mb-1">{ach.name}</div>
                  <div className="text-xs font-cyber" style={{ color: RARITY_COLORS[ach.rarity] }}>{ach.rarity}</div>
                  <div className="text-xs text-white/30 mt-1 font-body">{ach.desc}</div>
                  {!unlocked && <div className="text-xs text-white/20 mt-1">🔒 Locked</div>}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {activeTab === 'history' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="space-y-2">
            {historyData?.length ? historyData.map(match => {
              const myPlayer = match.players?.find(p =>
                p.user?.toString() === targetId?.toString() || p.user === targetId
              )
              const result = match.isDraw ? 'draw' : myPlayer?.result || 'unknown'
              const opponent = match.players?.find(p =>
                p.user?.toString() !== targetId?.toString() && p.user !== targetId
              )
              return (
                <div key={match._id} className={`card-glass rounded-xl px-5 py-4 flex items-center gap-4 border transition-all
                  ${result === 'win' ? 'border-green-400/15' : result === 'loss' ? 'border-red-400/15' : 'border-white/5'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0
                    ${result === 'win' ? 'bg-green-400' : result === 'loss' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                  <div className="text-xl">🎮</div>
                  <div className="flex-1">
                    <div className="font-body font-bold text-white capitalize">{match.game || 'Unknown'}</div>
                    <div className="text-xs text-white/30 font-body">
                      {opponent?.username ? `vs ${opponent.username} · ` : ''}
                      {match.createdAt ? formatDate(match.createdAt) : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-cyber text-sm font-bold
                      ${result === 'win' ? 'text-green-400' : result === 'loss' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {result.toUpperCase()}
                    </div>
                    <div className="text-xs text-neon-cyan font-cyber">+{match.xpAwarded || 10} XP</div>
                  </div>
                </div>
              )
            }) : (
              <div className="card-glass rounded-xl p-10 text-center border border-white/5">
                <div className="text-4xl mb-3">🎮</div>
                <p className="text-white/40 font-body">No matches played yet</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
