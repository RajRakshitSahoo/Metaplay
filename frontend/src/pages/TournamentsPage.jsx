import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiPlus, FiUsers, FiCalendar, FiAward, FiX } from 'react-icons/fi'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const GAMES = ['Chess', 'Ludo', 'Tic-Tac-Toe', 'Connect Four', 'Checkers', 'Battleship']
const STATUS_COLORS = { upcoming: '#F59E0B', registration: '#00F5FF', active: '#4ade80', finished: '#94a3b8' }

export default function TournamentsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', game: 'Chess', type: 'single_elimination', maxParticipants: 8, prizeXP: 500, description: '' })
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => api.get('/tournaments').then(r => r.data.tournaments),
    refetchInterval: 15000,
  })

  const createTournament = useMutation({
    mutationFn: (data) => api.post('/tournaments/create', data),
    onSuccess: () => { toast.success('Tournament created! 🏆'); qc.invalidateQueries(['tournaments']); setShowCreate(false) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create'),
  })

  const joinTournament = useMutation({
    mutationFn: (id) => api.post(`/tournaments/${id}/join`),
    onSuccess: () => { toast.success('Joined tournament!'); qc.invalidateQueries(['tournaments']) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to join'),
  })

  const isJoined = (t) => t.participants?.some(p => (p.user?._id || p.user) === user?._id)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-cyber text-3xl font-bold text-white">
            <span className="text-neon-yellow text-neon-glow">TOURNAMENTS</span>
          </h1>
          <p className="text-white/40 font-body text-sm">Compete in organized tournaments</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-neon text-sm py-2.5 px-5 flex items-center gap-2">
          <FiPlus /> Create Tournament
        </button>
      </motion.div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="card-glass rounded-2xl p-6 w-full max-w-md border border-neon-cyan/20">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-cyber text-lg text-white">CREATE TOURNAMENT</h2>
                <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white">
                  <FiX />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-cyber text-white/40 mb-1">TOURNAMENT NAME</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="input-cyber w-full" placeholder="Epic Championship 2025" />
                </div>
                <div>
                  <label className="block text-xs font-cyber text-white/40 mb-1">GAME</label>
                  <select value={form.game} onChange={e => setForm({...form, game: e.target.value})}
                    className="input-cyber w-full">
                    {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-cyber text-white/40 mb-1">FORMAT</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                      className="input-cyber w-full">
                      <option value="single_elimination">Single Elim.</option>
                      <option value="double_elimination">Double Elim.</option>
                      <option value="league">League</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-cyber text-white/40 mb-1">MAX PLAYERS</label>
                    <select value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: +e.target.value})}
                      className="input-cyber w-full">
                      {[4,8,16,32].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-cyber text-white/40 mb-1">PRIZE XP</label>
                  <input type="number" value={form.prizeXP} onChange={e => setForm({...form, prizeXP: +e.target.value})}
                    className="input-cyber w-full" min={100} step={100} />
                </div>
                <div>
                  <label className="block text-xs font-cyber text-white/40 mb-1">DESCRIPTION</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    className="input-cyber w-full h-20 resize-none" placeholder="Tournament description..." />
                </div>
                <button onClick={() => createTournament.mutate(form)} disabled={!form.name || createTournament.isLoading}
                  className="w-full btn-neon py-3 disabled:opacity-50">
                  {createTournament.isLoading ? 'Creating...' : '🏆 CREATE TOURNAMENT'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tournament list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="cyber-spinner" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(tournaments || []).length === 0 ? (
            <div className="col-span-2 card-glass rounded-2xl p-12 text-center border border-white/5">
              <div className="text-5xl mb-4">🏟️</div>
              <h3 className="font-cyber text-xl text-white mb-2">No Tournaments Yet</h3>
              <p className="text-white/40 font-body mb-6">Be the first to create a tournament!</p>
              <button onClick={() => setShowCreate(true)} className="btn-neon text-sm py-2.5 px-8">
                Create First Tournament
              </button>
            </div>
          ) : (
            (tournaments || []).map((t, i) => (
              <motion.div key={t._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="card-glass rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all">
                {/* Tournament header */}
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-cyber text-lg font-bold text-white mb-1">{t.name}</h3>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-2xl">{t.game === 'Chess' ? '♟️' : t.game === 'Ludo' ? '🎲' : '🎮'}</span>
                        <span className="text-white/60 font-body">{t.game}</span>
                      </div>
                    </div>
                    <span className="text-xs font-cyber px-2 py-1 rounded border"
                      style={{ color: STATUS_COLORS[t.status], borderColor: `${STATUS_COLORS[t.status]}40`, background: `${STATUS_COLORS[t.status]}10` }}>
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                  {t.description && <p className="text-white/40 text-sm font-body mb-3">{t.description}</p>}
                </div>

                {/* Stats */}
                <div className="px-5 pb-3 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center text-white/60 text-xs font-body">
                      <FiUsers className="w-3 h-3" />
                      <span>{t.participants?.length || 0}/{t.maxParticipants}</span>
                    </div>
                    <div className="text-xs text-white/30 font-body">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-neon-yellow font-cyber">{t.prizeXP} XP</div>
                    <div className="text-xs text-white/30 font-body">Prize</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-white/60 font-body capitalize">{t.type.replace('_', ' ')}</div>
                    <div className="text-xs text-white/30 font-body">Format</div>
                  </div>
                </div>

                {/* Participants */}
                <div className="px-5 pb-3 flex -space-x-2">
                  {t.participants?.slice(0, 6).map((p, pi) => (
                    <img key={pi} src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`}
                      alt="" className="w-7 h-7 rounded-full border-2 border-bg-card" title={p.username} />
                  ))}
                  {t.participants?.length > 6 && (
                    <div className="w-7 h-7 rounded-full border-2 border-bg-card bg-white/10 flex items-center justify-center text-xs text-white/60 font-cyber">
                      +{t.participants.length - 6}
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="px-5 pb-4">
                  {t.status === 'finished' ? (
                    <div className="text-center py-2 text-xs font-cyber text-white/30">Tournament Ended</div>
                  ) : isJoined(t) ? (
                    <div className="text-center py-2 text-xs font-cyber text-neon-cyan border border-neon-cyan/20 rounded">✓ Joined</div>
                  ) : t.participants?.length >= t.maxParticipants ? (
                    <div className="text-center py-2 text-xs font-cyber text-white/30 border border-white/10 rounded">Full</div>
                  ) : (
                    <button onClick={() => joinTournament.mutate(t._id)}
                      className="w-full btn-neon text-xs py-2.5">
                      JOIN TOURNAMENT
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
