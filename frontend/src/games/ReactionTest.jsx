import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function ReactionTest() {
  const [phase, setPhase] = useState('idle') // idle | waiting | ready | go | result | early
  const [reactionTime, setReactionTime] = useState(null)
  const [best, setBest] = useState(null)
  const [history, setHistory] = useState([])
  const startRef = useRef(null)
  const timerRef = useRef(null)

  const startRound = useCallback(() => {
    setPhase('waiting')
    setReactionTime(null)
    clearTimeout(timerRef.current)
    const delay = 2000 + Math.random() * 4000
    timerRef.current = setTimeout(() => {
      setPhase('go')
      startRef.current = performance.now()
    }, delay)
  }, [])

  const handleClick = useCallback(() => {
    if (phase === 'idle' || phase === 'result' || phase === 'early') {
      startRound()
      return
    }
    if (phase === 'waiting') {
      clearTimeout(timerRef.current)
      setPhase('early')
      return
    }
    if (phase === 'go') {
      const rt = Math.round(performance.now() - startRef.current)
      setReactionTime(rt)
      setHistory(h => [...h.slice(-9), rt])
      setBest(b => (b === null || rt < b ? rt : b))
      setPhase('result')
    }
  }, [phase, startRound])

  const getColor = (rt) => rt < 200 ? '#00F5FF' : rt < 300 ? '#34D399' : rt < 400 ? '#F59E0B' : '#FF6B6B'
  const getRating = (rt) => rt < 200 ? 'LEGENDARY ⚡' : rt < 250 ? 'EXCELLENT 🔥' : rt < 300 ? 'GREAT ✅' : rt < 400 ? 'GOOD 👍' : 'SLOW 🐢'

  const bgMap = {
    idle: 'bg-white/5 border-white/10',
    waiting: 'bg-yellow-500/10 border-yellow-500/30',
    ready: 'bg-yellow-500/10 border-yellow-500/30',
    go: 'bg-green-500/20 border-green-400/60',
    result: 'bg-neon-cyan/10 border-neon-cyan/30',
    early: 'bg-red-500/20 border-red-500/50',
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 select-none">
      <h2 className="font-cyber text-2xl font-bold text-white">REACTION TEST</h2>

      {best !== null && (
        <div className="card-glass rounded-xl px-6 py-2 text-center">
          <div className="font-cyber text-lg" style={{ color: getColor(best) }}>{best}ms</div>
          <div className="text-xs text-white/40">Best Time</div>
        </div>
      )}

      {/* Main click area */}
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={handleClick}
        className={`w-80 h-64 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${bgMap[phase]}`}
      >
        {phase === 'idle' && (
          <div className="text-center pointer-events-none">
            <div className="text-5xl mb-4">⚡</div>
            <div className="font-cyber text-lg text-white">Click to Start</div>
            <div className="text-white/40 text-sm mt-1">Test your reaction speed</div>
          </div>
        )}
        {phase === 'waiting' && (
          <div className="text-center pointer-events-none">
            <div className="text-5xl mb-4 animate-pulse">🟡</div>
            <div className="font-cyber text-lg text-yellow-400">Wait for green...</div>
            <div className="text-white/40 text-xs mt-1">Don't click yet!</div>
          </div>
        )}
        {phase === 'go' && (
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center pointer-events-none">
            <div className="text-5xl mb-4">🟢</div>
            <div className="font-cyber text-2xl text-green-400">CLICK NOW!</div>
          </motion.div>
        )}
        {phase === 'early' && (
          <div className="text-center pointer-events-none">
            <div className="text-5xl mb-4">🔴</div>
            <div className="font-cyber text-lg text-red-400">Too Early!</div>
            <div className="text-white/40 text-sm mt-2">Click to try again</div>
          </div>
        )}
        {phase === 'result' && reactionTime && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center pointer-events-none">
            <div className="font-cyber text-5xl font-bold mb-2" style={{ color: getColor(reactionTime) }}>
              {reactionTime}ms
            </div>
            <div className="font-cyber text-sm font-bold mb-3" style={{ color: getColor(reactionTime) }}>
              {getRating(reactionTime)}
            </div>
            <div className="text-white/40 text-xs">Click to try again</div>
          </motion.div>
        )}
      </motion.div>

      {/* History chart */}
      {history.length > 0 && (
        <div className="card-glass rounded-xl p-4 w-80">
          <div className="text-xs font-cyber text-white/40 mb-3">REACTION HISTORY</div>
          <div className="flex items-end gap-1 h-16">
            {history.map((rt, i) => {
              const maxRt = Math.max(...history)
              const height = Math.max(10, (rt / maxRt) * 100)
              return (
                <div key={i} className="flex-1 rounded-t-sm relative group"
                  style={{ height: `${height}%`, background: getColor(rt) }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-cyber opacity-0 group-hover:opacity-100 whitespace-nowrap"
                    style={{ color: getColor(rt) }}>{rt}</div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-white/30">Avg: {Math.round(history.reduce((a, b) => a + b, 0) / history.length)}ms</span>
            <span className="text-xs text-white/30">Best: {Math.min(...history)}ms</span>
          </div>
        </div>
      )}
    </div>
  )
}
