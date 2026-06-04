// WordScramble.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const WORDS = ['gaming','champion','victory','keyboard','strategy','reaction','multiplayer','tournament','leaderboard','achievement']

function scramble(word) {
  const a = word.split('')
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1));[a[i],a[j]] = [a[j],a[i]] }
  return a.join('')
}

export default function WordScramble() {
  const [wordIndex, setWordIndex] = useState(0)
  const [scrambled, setScrambled] = useState('')
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [result, setResult] = useState(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const w = WORDS[wordIndex % WORDS.length]
    setScrambled(scramble(w))
    setInput(''); setResult(null)
  }, [wordIndex])

  const submit = () => {
    const correct = input.toLowerCase().trim() === WORDS[wordIndex % WORDS.length]
    if (correct) { setScore(s => s + 10 + streak * 2); setStreak(s => s + 1); setResult('correct') }
    else { setStreak(0); setResult('wrong') }
    setTimeout(() => setWordIndex(i => i + 1), 1200)
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 max-w-md mx-auto w-full">
      <h2 className="font-cyber text-2xl font-bold text-white">WORD SCRAMBLE</h2>
      <div className="flex gap-4">
        <div className="card-glass rounded-xl px-5 py-2 text-center">
          <div className="font-cyber text-lg text-neon-cyan">{score}</div>
          <div className="text-xs text-white/40">Score</div>
        </div>
        <div className="card-glass rounded-xl px-5 py-2 text-center">
          <div className="font-cyber text-lg text-neon-yellow">{streak}🔥</div>
          <div className="text-xs text-white/40">Streak</div>
        </div>
      </div>

      <div className="card-glass rounded-2xl p-8 text-center w-full border border-neon-purple/20">
        <div className="font-cyber text-3xl font-bold text-neon-purple tracking-widest mb-2">{scrambled.toUpperCase()}</div>
        <div className="text-white/30 text-xs font-body">{scrambled.length} letters</div>
      </div>

      {result && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className={`font-cyber text-sm ${result === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
          {result === 'correct' ? '✓ Correct! +' + (10 + streak * 2) : `✗ Wrong! It was "${WORDS[wordIndex % WORDS.length]}"`}
        </motion.div>
      )}

      <div className="flex gap-2 w-full">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          className="input-cyber flex-1 text-center font-body text-lg" placeholder="Unscramble it..." autoFocus />
        <button onClick={submit} className="btn-purple px-5">GO</button>
      </div>
      <button onClick={() => setWordIndex(i => i + 1)} className="text-xs text-white/30 hover:text-white/60 font-body">Skip →</button>
    </div>
  )
}
