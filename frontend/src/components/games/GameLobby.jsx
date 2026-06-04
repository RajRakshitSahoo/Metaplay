import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiPlus, FiUsers, FiGlobe, FiLock, FiCopy } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'
import SinglePlayerGame from './SinglePlayerGame'

const MODES = [
  { id: 'solo', label: 'Solo / CPU', icon: '🤖', desc: 'Play against computer', minPlayers: 1 },
  { id: 'local', label: 'Local 1v1', icon: '🖥️', desc: 'Same device multiplayer', minPlayers: 2 },
  { id: 'online', label: 'Online Match', icon: '🌐', desc: 'Play with anyone online', minPlayers: 2 },
  { id: 'private', label: 'Private Room', icon: '🔒', desc: 'Invite friends with code', minPlayers: 2 },
]

export default function GameLobby({ game, onBack }) {
  const [mode, setMode] = useState(null)
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [soloPlay, setSoloPlay] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: publicRooms, refetch } = useQuery({
    queryKey: ['public-rooms', game.id],
    queryFn: () => api.get('/rooms/list/public').then(r => r.data.rooms?.filter(r => r.game === game.name)),
    enabled: mode === 'online',
    refetchInterval: 5000,
  })

  const createRoom = async (roomMode) => {
    setCreating(true)
    try {
      const { data } = await api.post('/rooms/create', {
        game: game.name, gameType: game.id,
        mode: roomMode === 'private' ? 'private' : 'public',
        maxPlayers: game.maxPlayers,
      })
      if (data.success) {
        if (roomMode === 'private') {
          toast.success(`Room created! Code: ${data.room.roomCode}`)
        }
        navigate(`/app/room/${data.room.roomCode}`, { state: { game } })
      }
    } catch (err) {
      toast.error('Failed to create room')
    }
    setCreating(false)
  }

  const joinRoom = async () => {
    if (!joinCode.trim()) { toast.error('Enter a room code'); return }
    try {
      const { data } = await api.get(`/rooms/${joinCode.toUpperCase()}`)
      if (data.success) navigate(`/app/room/${joinCode.toUpperCase()}`, { state: { game } })
      else toast.error('Room not found')
    } catch { toast.error('Room not found') }
  }

  if (soloPlay) return <SinglePlayerGame game={game} onBack={() => setSoloPlay(false)} />

  const filteredModes = MODES.filter(m => game.minPlayers === 1 || m.minPlayers > 1 || m.id === 'solo')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 text-sm font-body transition-colors">
          <FiArrowLeft /> Back to Games
        </button>
      </motion.div>

      {/* Game header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6 mb-10">
        <div className="text-7xl">{game.icon}</div>
        <div>
          <h1 className="font-cyber text-4xl font-bold text-white mb-1">{game.name}</h1>
          <p className="text-white/50 font-body">{game.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-3 py-1 rounded-full font-cyber capitalize"
              style={{ background: `${game.color}20`, color: game.color, border: `1px solid ${game.color}30` }}>
              {game.category}
            </span>
            <span className="text-xs text-white/30 font-body">{game.minPlayers}–{game.maxPlayers} players</span>
          </div>
        </div>
      </motion.div>

      {/* Mode selection */}
      {!mode && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-cyber text-lg text-white/70 mb-4 tracking-widest">SELECT MODE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredModes.map((m, i) => (
              <motion.button key={m.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.05, y: -3 }}
                onClick={() => {
                  if (m.id === 'solo') { setSoloPlay(true); return }
                  setMode(m.id)
                  if (m.id === 'local') { navigate(`/app/room/local-${game.id}`, { state: { game, mode: 'local' } }) }
                  if (m.id === 'online') createRoom('public')
                }}
                className="card-glass rounded-xl p-5 text-center hover:border-neon-cyan/30 border border-white/5 transition-all group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{m.icon}</div>
                <div className="font-cyber text-sm font-bold text-white mb-1">{m.label}</div>
                <div className="text-xs text-white/30 font-body">{m.desc}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Private room */}
      {mode === 'private' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card-glass rounded-xl p-6 border border-neon-cyan/20 max-w-md">
          <h2 className="font-cyber text-lg text-white mb-4">PRIVATE ROOM</h2>
          <div className="space-y-4">
            <button onClick={() => createRoom('private')} disabled={creating}
              className="w-full btn-neon py-3 flex items-center justify-center gap-2">
              <FiPlus /> {creating ? 'Creating...' : 'Create Room'}
            </button>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs font-body">or join existing</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="flex gap-2">
              <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                className="input-cyber flex-1 text-center font-cyber tracking-widest uppercase"
                placeholder="ROOM CODE" maxLength={8} />
              <button onClick={joinRoom} className="btn-purple px-4 py-2">JOIN</button>
            </div>
          </div>
          <button onClick={() => setMode(null)} className="mt-4 text-xs text-white/30 hover:text-white/60 font-body transition-colors">← Back</button>
        </motion.div>
      )}

      {/* Online lobby */}
      {mode === 'online' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cyber text-lg text-white/70">PUBLIC ROOMS</h2>
            <button onClick={() => createRoom('public')} disabled={creating}
              className="btn-neon text-xs py-2 px-4">
              <FiPlus className="inline mr-1" /> Create Room
            </button>
          </div>
          <div className="space-y-3">
            {(publicRooms || []).length === 0 && (
              <div className="card-glass rounded-xl p-8 text-center">
                <p className="text-white/40 font-body mb-4">No public rooms for {game.name}</p>
                <button onClick={() => createRoom('public')} className="btn-neon text-xs py-2 px-6">
                  Create First Room
                </button>
              </div>
            )}
            {(publicRooms || []).map(room => (
              <motion.div key={room._id} whileHover={{ scale: 1.01 }}
                className="card-glass rounded-xl p-4 flex items-center justify-between border border-white/5 hover:border-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{game.icon}</div>
                  <div>
                    <div className="font-body font-bold text-white text-sm">{room.host?.username}'s Room</div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <FiUsers className="w-3 h-3" />
                      {room.players?.length}/{room.maxPlayers}
                    </div>
                  </div>
                </div>
                <button onClick={() => navigate(`/app/room/${room.roomCode}`, { state: { game } })}
                  className="btn-neon text-xs py-2 px-4">JOIN</button>
              </motion.div>
            ))}
          </div>
          <button onClick={() => setMode(null)} className="mt-4 text-xs text-white/30 hover:text-white/60 font-body">← Back</button>
        </motion.div>
      )}
    </div>
  )
}
