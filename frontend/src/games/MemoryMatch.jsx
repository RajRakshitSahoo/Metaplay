import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'

const EMOJIS = ['🎮','🏆','⚡','🎯','🔥','💎','🚀','🌟','🎲','🎪','🦊','🐉']

function createDeck(pairs = 8) {
  const selected = EMOJIS.slice(0, pairs)
  const deck = [...selected, ...selected].sort(() => Math.random() - 0.5)
  return deck.map((emoji, i) => ({ id: i, emoji, isFlipped: false, isMatched: false }))
}

export default function MemoryMatch() {
  const [cards, setCards] = useState(createDeck())
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [difficulty, setDifficulty] = useState(8)
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    let t
    if (running && !gameWon) t = setInterval(() => setTime(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [running, gameWon])

  const flip = useCallback((id) => {
    if (isChecking || flipped.length === 2) return
    const card = cards.find(c => c.id === id)
    if (!card || card.isFlipped || card.isMatched) return

    if (!running) setRunning(true)
    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c))

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      setIsChecking(true)
      const [a, b] = newFlipped.map(fid => cards.find(c => c.id === fid))
      if (a.emoji === b.emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, isMatched: true } : c))
          const newMatches = matches + 1
          setMatches(newMatches)
          setFlipped([])
          setIsChecking(false)
          if (newMatches === difficulty) { setGameWon(true); setRunning(false) }
        }, 500)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c))
          setFlipped([])
          setIsChecking(false)
        }, 1000)
      }
    }
  }, [cards, flipped, isChecking, matches, difficulty, running])

  const reset = (diff = difficulty) => {
    setCards(createDeck(diff))
    setFlipped([]); setMoves(0); setMatches(0)
    setIsChecking(false); setGameWon(false); setTime(0); setRunning(false)
  }

  const cols = difficulty === 6 ? 4 : difficulty === 8 ? 4 : 6

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {gameWon && <Confetti recycle={false} />}
      <div className="flex items-center gap-4">
        <h2 className="font-cyber text-2xl font-bold text-white">MEMORY MATCH</h2>
      </div>

      <div className="flex items-center gap-2">
        {[{n:6,label:'Easy'},{n:8,label:'Medium'},{n:12,label:'Hard'}].map(d => (
          <button key={d.n} onClick={() => { setDifficulty(d.n); reset(d.n) }}
            className={`px-3 py-1 text-xs font-cyber rounded border transition-all ${difficulty === d.n ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' : 'border-white/10 text-white/40'}`}>
            {d.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6 text-center">
        <div className="card-glass rounded-xl px-5 py-2">
          <div className="font-cyber text-xl text-neon-cyan">{moves}</div>
          <div className="text-xs text-white/40">Moves</div>
        </div>
        <div className="card-glass rounded-xl px-5 py-2">
          <div className="font-cyber text-xl text-neon-purple">{matches}/{difficulty}</div>
          <div className="text-xs text-white/40">Matched</div>
        </div>
        <div className="card-glass rounded-xl px-5 py-2">
          <div className="font-cyber text-xl text-neon-yellow">{time}s</div>
          <div className="text-xs text-white/40">Time</div>
        </div>
      </div>

      {gameWon && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="card-glass rounded-xl p-4 text-center border border-neon-yellow/30">
          <div className="text-2xl mb-1">🏆</div>
          <div className="font-cyber text-neon-yellow">You Won!</div>
          <div className="text-white/50 text-xs font-body">{moves} moves in {time}s</div>
        </motion.div>
      )}

      <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cards.map((card) => (
          <motion.div key={card.id} onClick={() => flip(card.id)}
            whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl cursor-pointer border-2 transition-all duration-300
            ${card.isMatched ? 'border-green-400/50 bg-green-400/10' : card.isFlipped ? 'border-neon-cyan/40 bg-neon-cyan/10' : 'border-white/10 bg-white/5 hover:border-neon-cyan/30'}`}>
            <motion.span initial={false} animate={{ rotateY: card.isFlipped || card.isMatched ? 0 : 180 }}
              style={{ display: 'inline-block' }}>
              {card.isFlipped || card.isMatched ? card.emoji : '❓'}
            </motion.span>
          </motion.div>
        ))}
      </div>

      <button onClick={() => reset()} className="btn-neon text-sm py-2.5 px-8 mt-1">🔄 New Game</button>
    </div>
  )
}
