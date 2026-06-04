import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CHOICES = [
  { id: 'rock', emoji: '🪨', beats: 'scissors', label: 'Rock' },
  { id: 'paper', emoji: '📄', beats: 'rock', label: 'Paper' },
  { id: 'scissors', emoji: '✂️', beats: 'paper', label: 'Scissors' },
]

export default function RPS() {
  const [player, setPlayer] = useState(null)
  const [ai, setAi] = useState(null)
  const [result, setResult] = useState(null)
  const [scores, setScores] = useState({ player: 0, ai: 0, draw: 0 })
  const [animating, setAnimating] = useState(false)
  const [round, setRound] = useState(0)

  const play = (choice) => {
    if (animating) return
    setAnimating(true)
    setPlayer(choice)
    setAi(null)
    setResult(null)
    
    setTimeout(() => {
      const aiChoice = CHOICES[Math.floor(Math.random() * 3)]
      setAi(aiChoice)
      let res
      if (choice.id === aiChoice.id) res = 'draw'
      else if (choice.beats === aiChoice.id) res = 'win'
      else res = 'loss'
      setResult(res)
      setRound(r => r + 1)
      setScores(s => ({
        ...s,
        player: res === 'win' ? s.player + 1 : s.player,
        ai: res === 'loss' ? s.ai + 1 : s.ai,
        draw: res === 'draw' ? s.draw + 1 : s.draw,
      }))
      setAnimating(false)
    }, 800)
  }

  const reset = () => { setPlayer(null); setAi(null); setResult(null); setScores({ player: 0, ai: 0, draw: 0 }); setRound(0) }

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      <h2 className="font-cyber text-2xl font-bold text-white">ROCK PAPER SCISSORS</h2>

      {/* Scores */}
      <div className="flex gap-4">
        {[['You', scores.player, '#00F5FF'], ['AI', scores.ai, '#FF00FF'], ['Draw', scores.draw, '#F59E0B']].map(([l, v, c]) => (
          <div key={l} className="card-glass rounded-xl px-6 py-3 text-center">
            <div className="font-cyber text-2xl font-bold" style={{ color: c }}>{v}</div>
            <div className="text-xs text-white/40">{l}</div>
          </div>
        ))}
      </div>

      {/* Battle area */}
      <div className="flex items-center justify-between w-80 gap-4">
        <div className="flex-1 text-center">
          <div className="text-xs font-cyber text-neon-cyan mb-2 tracking-widest">YOU</div>
          <motion.div animate={{ scale: player ? 1 : 0.8, opacity: player ? 1 : 0.3 }}
            className="w-24 h-24 mx-auto card-glass rounded-2xl flex items-center justify-center text-5xl border-2"
            style={{ borderColor: result === 'win' ? '#00F5FF' : result === 'loss' ? '#FF6B6B' : 'rgba(255,255,255,0.1)' }}>
            {player?.emoji || '❓'}
          </motion.div>
          {player && <div className="text-xs text-white/50 mt-1 font-body">{player.label}</div>}
        </div>

        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div key={result || 'vs'} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className={`font-cyber text-lg font-bold ${result === 'win' ? 'text-neon-cyan' : result === 'loss' ? 'text-red-400' : result === 'draw' ? 'text-yellow-400' : 'text-white/30'}`}>
              {result === 'win' ? '🎉' : result === 'loss' ? '💀' : result === 'draw' ? '🤝' : 'VS'}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex-1 text-center">
          <div className="text-xs font-cyber text-neon-pink mb-2 tracking-widest">AI</div>
          <motion.div animate={{ scale: ai ? 1 : 0.8 }}
            className={`w-24 h-24 mx-auto card-glass rounded-2xl flex items-center justify-center text-5xl border-2 ${animating ? 'animate-pulse' : ''}`}
            style={{ borderColor: result === 'loss' ? '#FF00FF' : result === 'win' ? '#FF6B6B' : 'rgba(255,255,255,0.1)' }}>
            {animating ? '🤔' : ai?.emoji || '❓'}
          </motion.div>
          {ai && <div className="text-xs text-white/50 mt-1 font-body">{ai.label}</div>}
        </div>
      </div>

      {/* Result message */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div key={round} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="font-cyber text-lg">
            {result === 'win' && <span className="text-neon-cyan text-neon-glow">You Win! 🎉</span>}
            {result === 'loss' && <span className="text-red-400">AI Wins! 🤖</span>}
            {result === 'draw' && <span className="text-yellow-400">Draw! 🤝</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Choices */}
      <div className="flex gap-4">
        {CHOICES.map((choice) => (
          <motion.button key={choice.id} whileHover={{ scale: 1.1, y: -4 }} whileTap={{ scale: 0.9 }}
            onClick={() => play(choice)} disabled={animating}
            className="w-20 h-20 card-glass rounded-2xl flex flex-col items-center justify-center text-3xl cursor-pointer border border-white/10 hover:border-neon-cyan/40 transition-all disabled:opacity-50 gap-1">
            {choice.emoji}
            <span className="text-xs font-cyber text-white/50">{choice.label}</span>
          </motion.button>
        ))}
      </div>

      <button onClick={reset} className="text-xs text-white/30 hover:text-white/60 font-body transition-colors">Reset Scores</button>
    </div>
  )
}
