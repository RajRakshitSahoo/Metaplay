import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiSearch, FiUserPlus, FiCheck, FiX, FiMessageSquare, FiUser } from 'react-icons/fi'
import api from '../utils/api'
import { getRankColor } from '../utils/constants'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

export default function FriendsPage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('friends')
  const qc = useQueryClient()
  const { user } = useAuthStore()

  const { data: friends } = useQuery({
    queryKey: ['friends'],
    queryFn: () => api.get('/friends').then(r => r.data.friends),
  })
  const { data: requests } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: () => api.get('/friends/requests').then(r => r.data.requests),
  })
  const { data: searchResults } = useQuery({
    queryKey: ['user-search', search],
    queryFn: () => api.get(`/users/search/${search}`).then(r => r.data.users),
    enabled: search.length >= 2,
  })

  const sendRequest = useMutation({
    mutationFn: (userId) => api.post(`/friends/request/${userId}`),
    onSuccess: () => { toast.success('Friend request sent!'); qc.invalidateQueries(['user-search']) },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  })

  const handleRequest = useMutation({
    mutationFn: ({ userId, action }) => api.put(`/friends/request/${userId}/${action}`),
    onSuccess: (_, { action }) => {
      toast.success(action === 'accept' ? 'Friend added! 🎉' : 'Request declined')
      qc.invalidateQueries(['friends'])
      qc.invalidateQueries(['friend-requests'])
    },
  })

  const removeFriend = useMutation({
    mutationFn: (userId) => api.delete(`/friends/${userId}`),
    onSuccess: () => { toast.success('Friend removed'); qc.invalidateQueries(['friends']) },
  })

  const StatusDot = ({ status }) => (
    <div className={`w-3 h-3 rounded-full border-2 border-bg-primary ${status === 'online' ? 'bg-green-400' : status === 'in-game' ? 'bg-yellow-400' : 'bg-white/20'}`} />
  )

  const FriendCard = ({ friend }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="card-glass rounded-xl p-4 flex items-center gap-4 border border-white/5 hover:border-white/15 transition-all">
      <div className="relative">
        <img src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
          alt="" className="w-12 h-12 rounded-full border-2 border-white/10" />
        <div className="absolute bottom-0 right-0"><StatusDot status={friend.status} /></div>
      </div>
      <div className="flex-1">
        <div className="font-body font-bold text-white">{friend.username}</div>
        <div className="flex items-center gap-2 text-xs">
          <span style={{ color: getRankColor(friend.rank) }}>{friend.rank}</span>
          <span className="text-white/20">•</span>
          <span className="text-white/40">Lv.{friend.level}</span>
          <span className="text-white/20">•</span>
          <span className={friend.status === 'online' ? 'text-green-400' : friend.status === 'in-game' ? 'text-yellow-400' : 'text-white/30'}>
            {friend.status || 'offline'}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Link to={`/app/chat/${friend._id}`}
          className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all">
          <FiMessageSquare className="w-4 h-4" />
        </Link>
        <Link to={`/app/profile/${friend._id}`}
          className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/30 transition-all">
          <FiUser className="w-4 h-4" />
        </Link>
        <button onClick={() => { if (confirm('Remove friend?')) removeFriend.mutate(friend._id) }}
          className="p-2 rounded-lg border border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/30 transition-all">
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-cyber text-3xl font-bold text-white mb-1">
          FRIENDS <span className="text-neon-cyan text-neon-glow">({friends?.length || 0})</span>
        </h1>
        <p className="text-white/40 font-body text-sm">Connect and play with your friends</p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-cyber pl-11 w-full" placeholder="Search players by username..." />
      </div>

      {/* Search results */}
      <AnimatePresence>
        {search.length >= 2 && searchResults && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="card-glass rounded-xl p-4 mb-6 border border-neon-cyan/20">
            <div className="text-xs font-cyber text-white/40 mb-3 tracking-widest">SEARCH RESULTS</div>
            {searchResults.length === 0 ? (
              <p className="text-white/30 text-sm font-body text-center py-2">No players found</p>
            ) : searchResults.map(p => (
              <div key={p._id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <img src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`}
                  alt="" className="w-9 h-9 rounded-full border border-white/10" />
                <div className="flex-1">
                  <div className="font-body font-semibold text-white">{p.username}</div>
                  <div className="text-xs" style={{ color: getRankColor(p.rank) }}>{p.rank} • Lv.{p.level}</div>
                </div>
                {friends?.some(f => f._id === p._id) ? (
                  <span className="text-xs text-green-400 font-cyber px-3 py-1 border border-green-400/30 rounded">Friends ✓</span>
                ) : (
                  <button onClick={() => sendRequest.mutate(p._id)} disabled={sendRequest.isLoading}
                    className="btn-neon text-xs py-1.5 px-4 flex items-center gap-1">
                    <FiUserPlus className="w-3 h-3" /> Add
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[['friends', `Friends (${friends?.length || 0})`], ['requests', `Requests (${requests?.length || 0})`]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-cyber transition-all border
            ${activeTab === id ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Friends list */}
      {activeTab === 'friends' && (
        <div className="space-y-3">
          {friends?.length === 0 ? (
            <div className="card-glass rounded-xl p-10 text-center border border-white/5">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-white/40 font-body">No friends yet — search for players above!</p>
            </div>
          ) : friends?.map(f => <FriendCard key={f._id} friend={f} />)}
        </div>
      )}

      {/* Friend requests */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {requests?.length === 0 ? (
            <div className="card-glass rounded-xl p-10 text-center border border-white/5">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-white/40 font-body">No pending friend requests</p>
            </div>
          ) : requests?.map(req => (
            <motion.div key={req._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="card-glass rounded-xl p-4 flex items-center gap-4 border border-neon-purple/20">
              <img src={req.from?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.from?.username}`}
                alt="" className="w-12 h-12 rounded-full border-2 border-neon-purple/30" />
              <div className="flex-1">
                <div className="font-body font-bold text-white">{req.from?.username}</div>
                <div className="text-xs" style={{ color: getRankColor(req.from?.rank) }}>{req.from?.rank} • Lv.{req.from?.level}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleRequest.mutate({ userId: req.from?._id, action: 'accept' })}
                  className="p-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all">
                  <FiCheck className="w-4 h-4" />
                </button>
                <button onClick={() => handleRequest.mutate({ userId: req.from?._id, action: 'reject' })}
                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
