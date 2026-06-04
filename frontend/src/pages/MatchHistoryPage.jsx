// MatchHistoryPage.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import { formatDate, formatDuration } from '../utils/constants'

export default function MatchHistoryPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['match-history'],
    queryFn: () => api.get('/matchhistory/me').then(r => r.data.matches),
  })

  const getGameEmoji = (game) => {
    const map = { chess: '♟️', ludo: '🎲', tictactoe: '⭕', connectfour: '🔴', memory: '🃏', typing: '⌨️', reaction: '⚡', rps: '✂️', battleship: '🚢', sudoku: '🔢', minesweeper: '💣', '2048': '🎯' }
    return map[game?.toLowerCase()] || '🎮'
  }

  const wins = data?.filter(m => m.players?.find(p => p.user === user?._id)?.result === 'win').length || 0
  const losses = data?.filter(m => m.players?.find(p => p.user === user?._id)?.result === 'loss').length || 0
  const draws = data?.filter(m => m.isDraw).length || 0

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-cyber text-3xl font-bold text-white mb-1">MATCH <span className="text-neon-cyan text-neon-glow">HISTORY</span></h1>
        <p className="text-white/40 font-body text-sm">Your complete battle record</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[['Wins', wins, '#4ade80'], ['Losses', losses, '#f87171'], ['Draws', draws, '#fbbf24']].map(([l,v,c]) => (
          <div key={l} className="card-glass rounded-xl p-4 text-center">
            <div className="font-cyber text-3xl font-bold" style={{ color: c }}>{v}</div>
            <div className="text-white/40 text-sm font-body">{l}</div>
          </div>
        ))}
      </div>

      {/* Matches */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="cyber-spinner" /></div>
      ) : (
        <div className="space-y-2">
          {(data || []).length === 0 ? (
            <div className="card-glass rounded-xl p-12 text-center">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="font-cyber text-xl text-white mb-2">No matches yet!</h3>
              <p className="text-white/40 font-body">Play your first game to see history here</p>
            </div>
          ) : data.map((match, i) => {
            const myPlayer = match.players?.find(p => p.user === user?._id || p.user?.toString() === user?._id?.toString())
            const result = match.isDraw ? 'draw' : myPlayer?.result || 'unknown'
            const opponent = match.players?.find(p => p.user !== user?._id && p.user?.toString() !== user?._id?.toString())
            return (
              <motion.div key={match._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                className={`card-glass rounded-xl px-5 py-4 flex items-center gap-4 border transition-all hover:border-white/15
                ${result === 'win' ? 'border-green-400/15' : result === 'loss' ? 'border-red-400/15' : 'border-white/5'}`}>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${result === 'win' ? 'bg-green-400' : result === 'loss' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                <div className="text-2xl">{getGameEmoji(match.game)}</div>
                <div className="flex-1">
                  <div className="font-body font-bold text-white capitalize">{match.game}</div>
                  <div className="text-xs text-white/30 font-body">
                    vs {opponent?.username || 'Unknown'} · {formatDate(match.createdAt)}
                    {match.duration ? ` · ${formatDuration(match.duration)}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-cyber text-sm font-bold ${result === 'win' ? 'text-green-400' : result === 'loss' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {result.toUpperCase()}
                  </div>
                  <div className="text-xs text-neon-cyan font-cyber">+{match.xpAwarded || 10} XP</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
