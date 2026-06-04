import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NumberGuess() {
  const [secret] = useState(() => Math.floor(Math.random() * 100) + 1)
  const [input, setInput] = useState('')
  const [guesses, setGuesses] = useState([])
  const [won, setWon] = useState(false)
  const [maxGuesses] = useState(7)

  const guess = () => {
    const n = parseInt(input)
    if (!n || n < 1 || n > 100) return
    const hint = n === secret ? 'correct' : n < secret ? 'low' : 'high'
    const newGuesses = [...guesses, { n, hint }]
    setGuesses(newGuesses)
    setInput('')
    if (hint === 'correct') setWon(true)
  }

  const reset = () => { setGuesses([]); setInput(''); setWon(false) }
  const lost = !won && guesses.length >= maxGuesses

  return (
    <div className="flex flex-col items-center gap-5 py-4 max-w-md mx-auto w-full">
      <h2 className="font-cyber text-2xl font-bold text-white">NUMBER GUESS</h2>
      <p className="text-white/40 text-sm font-body text-center">Guess the number between 1 and 100</p>

      <div className="flex gap-4">
        <div className="card-glass rounded-xl px-5 py-2 text-center">
          <div className="font-cyber text-lg text-neon-cyan">{maxGuesses - guesses.length}</div>
          <div className="text-xs text-white/40">Guesses Left</div>
        </div>
        <div className="card-glass rounded-xl px-5 py-2 text-center">
          <div className="font-cyber text-lg text-neon-purple">{guesses.length}</div>
          <div className="text-xs text-white/40">Attempts</div>
        </div>
      </div>

      {!won && !lost && (
        <div className="flex gap-2 w-full">
          <input type="number" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && guess()}
            className="input-cyber flex-1 text-center font-cyber text-lg" placeholder="1-100" min={1} max={100} />
          <button onClick={guess} className="btn-purple px-5">GUESS</button>
        </div>
      )}

      {(won || lost) && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className={`card-glass rounded-xl p-5 text-center w-full border ${won ? 'border-neon-cyan/30' : 'border-red-400/30'}`}>
          <div className="text-3xl mb-2">{won ? '🎉' : '💀'}</div>
          <div className="font-cyber font-bold" style={{ color: won ? '#00F5FF' : '#FF6B6B' }}>
            {won ? `Found it in ${guesses.length} guesses!` : `The number was ${secret}`}
          </div>
          <button onClick={reset} className="mt-3 btn-neon text-xs py-2 px-5">Play Again</button>
        </motion.div>
      )}

      <div className="w-full space-y-2">
        <AnimatePresence>
          {guesses.map((g, i) => (
            <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className={`flex items-center justify-between card-glass rounded-lg px-4 py-2 border
              ${g.hint === 'correct' ? 'border-green-400/40' : g.hint === 'low' ? 'border-blue-400/20' : 'border-red-400/20'}`}>
              <span className="font-cyber text-lg text-white">{g.n}</span>
              <span className="font-cyber text-sm" style={{ color: g.hint === 'correct' ? '#4ade80' : g.hint === 'low' ? '#60a5fa' : '#f87171' }}>
                {g.hint === 'correct' ? '✓ Correct!' : g.hint === 'low' ? '↑ Too Low' : '↓ Too High'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
