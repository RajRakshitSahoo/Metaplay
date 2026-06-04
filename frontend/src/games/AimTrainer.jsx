import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AimTrainer() {
  const [targets, setTargets] = useState([])
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [accuracy, setAccuracy] = useState(100)
  const [totalClicks, setTotalClicks] = useState(0)
  const areaRef = useRef(null)
  const idRef = useRef(0)

  const spawnTarget = useCallback(() => {
    if (!areaRef.current) return
    const { width, height } = areaRef.current.getBoundingClientRect()
    const size = Math.random() * 40 + 20
    const x = Math.random() * (width - size - 20) + 10
    const y = Math.random() * (height - size - 20) + 10
    const id = ++idRef.current
    setTargets(prev => [...prev, { id, x, y, size }])
    setTimeout(() => setTargets(prev => prev.filter(t => t.id !== id)), 2000)
  }, [])

  useEffect(() => {
    if (!running || finished) return
    const spawnInterval = setInterval(spawnTarget, 800)
    const countdown = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setRunning(false); setFinished(true); clearInterval(spawnInterval); clearInterval(countdown); return 0 }
        return t - 1
      })
    }, 1000)
    spawnTarget()
    return () => { clearInterval(spawnInterval); clearInterval(countdown) }
  }, [running, finished, spawnTarget])

  const hitTarget = (e, id) => {
    e.stopPropagation()
    setTargets(prev => prev.filter(t => t.id !== id))
    setScore(s => s + 1)
    const newTotal = totalClicks + 1
    setTotalClicks(newTotal)
    setAccuracy(Math.round(((score + 1) / (score + 1 + misses)) * 100))
  }

  const missClick = () => {
    if (!running) return
    setMisses(m => m + 1)
    setTotalClicks(t => t + 1)
    setAccuracy(Math.round((score / (score + misses + 1)) * 100))
  }

  const start = () => { setScore(0); setMisses(0); setTimeLeft(30); setTargets([]); setRunning(true); setFinished(false); setTotalClicks(0); setAccuracy(100) }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <h2 className="font-cyber text-2xl font-bold text-white">AIM TRAINER</h2>

      <div className="flex gap-4">
        {[['Hits', score, '#00F5FF'], ['Misses', misses, '#FF6B6B'], ['Accuracy', `${accuracy}%`, '#34D399'], ['Time', `${timeLeft}s`, timeLeft < 10 ? '#FF6B6B' : '#F59E0B']].map(([l,v,c]) => (
          <div key={l} className="card-glass rounded-xl px-4 py-2 text-center">
            <div className="font-cyber text-lg font-bold" style={{ color: c }}>{v}</div>
            <div className="text-xs text-white/40">{l}</div>
          </div>
        ))}
      </div>

      <div ref={areaRef} onClick={missClick}
        className="relative w-full max-w-xl h-72 bg-bg-secondary rounded-2xl border-2 border-white/10 overflow-hidden cursor-crosshair select-none"
        style={{ background: 'radial-gradient(ellipse at center, #0f172a 0%, #050816 100%)' }}>
        {!running && !finished && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
            <div className="text-4xl">🎯</div>
            <p className="text-white/50 font-body text-sm">Click targets as fast as possible</p>
            <button onClick={(e) => { e.stopPropagation(); start() }} className="btn-neon text-sm py-2.5 px-8 z-10">
              START
            </button>
          </div>
        )}
        {finished && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center flex-col gap-2 bg-black/50">
            <div className="text-4xl">🎯</div>
            <div className="font-cyber text-2xl text-neon-cyan">{score} Hits</div>
            <div className="text-white/60 font-body text-sm">{accuracy}% accuracy</div>
            <button onClick={(e) => { e.stopPropagation(); start() }} className="btn-neon text-sm py-2 px-6 mt-2">Play Again</button>
          </motion.div>
        )}
        <AnimatePresence>
          {targets.map(t => (
            <motion.div key={t.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              onClick={(e) => hitTarget(e, t.id)}
              className="absolute rounded-full cursor-crosshair flex items-center justify-center"
              style={{
                left: t.x, top: t.y, width: t.size, height: t.size,
                background: 'radial-gradient(circle, #FF4444 30%, #FF000080 70%)',
                border: '2px solid #FF6666',
                boxShadow: '0 0 15px rgba(255,68,68,0.7)',
              }} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
