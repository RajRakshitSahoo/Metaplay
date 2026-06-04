import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const TEXTS = [
  "The quick brown fox jumps over the lazy dog near the old wooden fence.",
  "Gaming is not just a hobby it is a way of life for millions of players worldwide.",
  "Speed and accuracy are the keys to mastering the art of typing fast.",
  "Practice makes perfect and every keystroke brings you closer to victory.",
  "Champions are made in the moments when they want to quit but they keep going.",
]

export default function TypingGame() {
  const [text] = useState(() => TEXTS[Math.floor(Math.random() * TEXTS.length)])
  const [input, setInput] = useState('')
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [errors, setErrors] = useState(0)
  const inputRef = useRef(null)
  const startTime = useRef(null)

  useEffect(() => {
    if (!started || finished) return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setFinished(true); clearInterval(t); calcStats(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [started, finished])

  const calcStats = useCallback(() => {
    const elapsed = (Date.now() - startTime.current) / 1000 / 60
    const wordsTyped = input.trim().split(' ').length
    setWpm(Math.round(wordsTyped / Math.max(elapsed, 0.01)))
  }, [input])

  const handleChange = (e) => {
    const val = e.target.value
    if (!started) { setStarted(true); startTime.current = Date.now() }
    if (finished) return
    setInput(val)

    let errs = 0
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== text[i]) errs++
    }
    setErrors(errs)
    setAccuracy(val.length ? Math.round(((val.length - errs) / val.length) * 100) : 100)

    if (val === text) {
      setFinished(true)
      calcStats()
    }
  }

  const reset = () => {
    setInput(''); setStarted(false); setFinished(false)
    setTimeLeft(60); setWpm(0); setAccuracy(100); setErrors(0)
    inputRef.current?.focus()
  }

  const getCharClass = (i) => {
    if (i >= input.length) return 'text-white/30'
    return input[i] === text[i] ? 'text-neon-cyan' : 'text-red-400 bg-red-400/10'
  }

  const currentWpm = started && !finished ? (() => {
    const elapsed = (Date.now() - (startTime.current || Date.now())) / 1000 / 60
    return Math.round(input.trim().split(' ').length / Math.max(elapsed, 0.01))
  })() : wpm

  return (
    <div className="flex flex-col items-center gap-6 py-4 max-w-2xl mx-auto w-full">
      <h2 className="font-cyber text-2xl font-bold text-white">TYPING BATTLE</h2>

      {/* Stats */}
      <div className="flex gap-4 w-full justify-center">
        {[
          { label: 'WPM', value: currentWpm, color: '#00F5FF' },
          { label: 'Accuracy', value: `${accuracy}%`, color: '#34D399' },
          { label: 'Errors', value: errors, color: '#FF6B6B' },
          { label: started && !finished ? 'Time' : 'Time', value: started && !finished ? `${timeLeft}s` : '60s', color: timeLeft < 10 ? '#FF6B6B' : '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="card-glass rounded-xl px-4 py-2 text-center flex-1">
            <div className="font-cyber text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Time bar */}
      {started && !finished && (
        <div className="w-full bg-white/5 rounded-full h-1.5">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
            animate={{ width: `${(timeLeft / 60) * 100}%` }} transition={{ duration: 0.9 }} />
        </div>
      )}

      {/* Text display */}
      <div className="card-glass rounded-xl p-6 w-full font-mono text-base leading-relaxed border border-white/10">
        {text.split('').map((char, i) => (
          <span key={i} className={`transition-all ${getCharClass(i)} ${i === input.length ? 'border-l-2 border-neon-cyan' : ''}`}>
            {char}
          </span>
        ))}
      </div>

      {!finished ? (
        <textarea ref={inputRef} value={input} onChange={handleChange}
          autoFocus disabled={finished}
          className="input-cyber w-full h-24 resize-none font-mono"
          placeholder={started ? '' : 'Start typing to begin...'} />
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="card-glass rounded-xl p-8 text-center w-full border border-neon-cyan/20">
          <div className="text-4xl mb-2">⌨️</div>
          <div className="font-cyber text-2xl font-bold text-neon-cyan mb-1">{wpm} WPM</div>
          <div className="text-white/60 font-body">{accuracy}% accuracy · {errors} errors</div>
          <div className="text-xs text-white/30 mt-2 font-body">
            {wpm >= 100 ? '🏆 Legendary Typist!' : wpm >= 70 ? '⚡ Excellent Speed!' : wpm >= 50 ? '✅ Good job!' : '💪 Keep practicing!'}
          </div>
        </motion.div>
      )}

      <button onClick={reset} className="btn-neon text-sm py-2.5 px-8">🔄 New Test</button>
    </div>
  )
}
