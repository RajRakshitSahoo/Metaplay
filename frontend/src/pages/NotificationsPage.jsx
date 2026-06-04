import React from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiBell, FiCheck } from 'react-icons/fi'
import api from '../utils/api'
import { formatDate } from '../utils/constants'

const NOTIF_ICONS = {
  friend_request: '👥', match_invite: '🎮', tournament_start: '🏆',
  achievement: '🏅', level_up: '⬆️', rank_up: '🎖️', friend_online: '🟢', system: '⚡',
}

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data.notifications),
    refetchInterval: 30000,
  })

  const markRead = useMutation({
    mutationFn: (id) => id === 'all' ? api.put('/notifications/read-all') : api.put(`/notifications/read/${id}`),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  })

  const unread = data?.filter(n => !n.isRead).length || 0

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-cyber text-3xl font-bold text-white flex items-center gap-3">
            NOTIFICATIONS
            {unread > 0 && (
              <span className="text-sm bg-neon-pink text-white rounded-full px-2 py-0.5 font-cyber">{unread}</span>
            )}
          </h1>
          <p className="text-white/40 font-body text-sm">Your activity feed</p>
        </div>
        {unread > 0 && (
          <button onClick={() => markRead.mutate('all')}
            className="flex items-center gap-2 text-xs font-cyber text-white/50 hover:text-neon-cyan border border-white/10 hover:border-neon-cyan/30 px-3 py-2 rounded-lg transition-all">
            <FiCheck className="w-3 h-3" /> Mark all read
          </button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="cyber-spinner" /></div>
      ) : (
        <div className="space-y-2">
          {(!data || data.length === 0) ? (
            <div className="card-glass rounded-xl p-12 text-center border border-white/5">
              <FiBell className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="font-cyber text-lg text-white mb-2">All caught up!</h3>
              <p className="text-white/40 font-body text-sm">No notifications yet</p>
            </div>
          ) : data.map((notif, i) => (
            <motion.div key={notif._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => !notif.isRead && markRead.mutate(notif._id)}
              className={`card-glass rounded-xl px-5 py-4 flex items-start gap-4 border transition-all cursor-pointer
              ${!notif.isRead ? 'border-neon-cyan/20 bg-neon-cyan/3 hover:bg-neon-cyan/5' : 'border-white/5 opacity-60 hover:opacity-80'}`}>
              <div className="text-2xl flex-shrink-0">{NOTIF_ICONS[notif.type] || '🔔'}</div>
              <div className="flex-1">
                <div className="font-body font-bold text-white text-sm">{notif.title}</div>
                <div className="text-white/50 text-sm font-body mt-0.5">{notif.message}</div>
                <div className="text-white/30 text-xs font-body mt-1">{formatDate(notif.createdAt)}</div>
              </div>
              {!notif.isRead && <div className="w-2 h-2 rounded-full bg-neon-cyan flex-shrink-0 mt-1" />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
